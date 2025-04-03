import { useCallback, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN, web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { AppSettingsModal } from '@banx/components/AppSettingsModal'

import { fetchConversionRate } from '@banx/api/common'
import { CollateralToken, core } from '@banx/api/tokens'
import { USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { useCollateralsList, useTokenBondOffers, useWalletCollateralBalance } from '@banx/hooks'
import { useModal, useSlippage, useTokenType } from '@banx/store'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { CreateLeverageParams } from '@banx/transactions/leverage/common/createLeverageTxnData'
import { parseTokenBorrowSimulatedAccounts } from '@banx/transactions/tokenLending'
import {
  ZERO_BN,
  bnToHuman,
  bnToNumberSafe,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
  getTokenUnit,
  stringToBN,
} from '@banx/utils'

import { MIN_MULTIPLIER_VALUE, MULTIPLY_PAIRS } from './constants'
import {
  calculateTokenLoanBorrowAmount,
  collateralPriceFromConversionRate,
  createLeverageSimpleOffers,
  createMultiplyPairFromCollateral,
} from './helpers'
import { LeverageSimpleOffer, MultiplyPair } from './types'

export const useSelectedCollateralInfo = (customPairTicker?: string) => {
  const customPair = useMemo(() => {
    if (customPairTicker)
      return MULTIPLY_PAIRS.find(({ collateralTicker }) => collateralTicker === customPairTicker)
    return undefined
  }, [customPairTicker])

  const { tokenType } = useTokenType()

  const [selectedToken, setSelectedToken] = useState<CollateralToken | undefined>(undefined)

  const { collateralsList: collateralTokensList, isLoading: collateralsListLoading } =
    useCollateralsList(customPair?.marketTokenType)

  const patchedCollateralTokensList = useMemo(() => {
    return collateralTokensList.filter(({ collateral }) => {
      //? Remove USDC from tokensList on USDC market to prevent USDC/USDC multiply
      if (tokenType === LendingTokenType.Usdc) {
        return collateral.mint !== USDC_ADDRESS
      }
      //? Remove SOL from tokensList on banxSOL market to prevent SOL/SOL multiply
      if (tokenType === LendingTokenType.BanxSol) {
        return collateral.mint !== WSOL_ADDRESS
      }
      return true
    })
  }, [collateralTokensList, tokenType])

  const pair = useMemo(() => {
    if (!patchedCollateralTokensList.length) return undefined

    //? If using custom pairs
    if (customPair) {
      const pair = customPair
      const collateral = patchedCollateralTokensList.find(
        (token) => token.collateral.mint === pair?.collateralMint.toBase58(),
      )
      if (collateral) {
        setSelectedToken(collateral)
      }
      return pair
    }

    const collateral = selectedToken || patchedCollateralTokensList[0]
    setSelectedToken(collateral)

    const multiplyPair: MultiplyPair = createMultiplyPairFromCollateral(
      collateral.collateral,
      collateral.marketPubkey,
      tokenType,
    )
    return multiplyPair
  }, [patchedCollateralTokensList, customPair, selectedToken, tokenType])

  const onCollateralChange = useCallback((token: CollateralToken) => {
    setSelectedToken(token)
  }, [])

  return {
    pair,
    collateralToken: selectedToken,
    collateralTokensList,
    onCollateralChange,
    isLoading: collateralsListLoading,
  }
}

type UseLeverageParams = {
  pair: MultiplyPair
  collateralToken: CollateralToken
}

export const useLeverage = ({ pair, collateralToken }: UseLeverageParams) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { open } = useModal()
  const { slippage, slippageBps } = useSlippage()

  const { walletCollateralBalance } = useWalletCollateralBalance(pair.collateralMint)

  const { rate: collateralConversionRate, isLoading: isCollateralConversionRateLoading } =
    useCollateralConversionRate({
      pair,
      collateralDecimals: collateralToken.collateral.decimals,
      mode: 'leverage',
      slippageBps,
      connection,
    })

  const collateralPriceHuman = collateralConversionRate ? 1 / collateralConversionRate : 0

  const [multiplierValue, setMultiplierValue] = useState<number>(MIN_MULTIPLIER_VALUE)
  const defaultCollateralAmount = pair.minPositionSize
    ? bnToHuman(pair.minPositionSize, collateralToken.collateral.decimals).toString()
    : ''
  const [collateralAmount, setCollateralAmount] = useState<string>(defaultCollateralAmount)

  const [selectedOffer, setSelectedOffer] = useState<LeverageSimpleOffer | undefined>(undefined)
  const [borrowBtnLoading, setBorrowBtnLoading] = useState(false)

  const {
    offers,
    isLoading: offersLoading,
    updateOrAddOptimisticOffer,
  } = useTokenBondOffers({
    marketPubkey: pair.marketPublicKey,
    lendingTokenType: pair.marketTokenType,
  })
  const { add: addLoansOptimistic } = useTokenLoansOptimistic()

  const simpleOffers: LeverageSimpleOffer[] = useMemo(() => {
    if (isEmpty(offers) || collateralConversionRate === 0) return []

    return createLeverageSimpleOffers({
      offers,
      lendingTokenType: pair.marketTokenType,
      collateralDecimals: collateralToken.collateral.decimals,
      collateralConversionRate,
      minCollateralToReceiveFilter: pair.minPositionSize,
    })
  }, [collateralToken.collateral.decimals, collateralConversionRate, offers, pair])

  const userEnteredCollateralAmount = stringToBN(
    collateralAmount,
    collateralToken.collateral.decimals,
  )
  const totalCollateralAmount = userEnteredCollateralAmount.mul(new BN(multiplierValue))

  const onLeverageBorrow = async () => {
    const loadingSnackbarId = uniqueId()
    setBorrowBtnLoading(true)
    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await pair.createLeverageTxnHandler(
        {
          collateralConversionRate,
          totalCollateralAmount,
          offer: selectedOffer!,
          multiplier: multiplierValue,
          userEnteredCollateralAmount,
          collateralTokenMeta: collateralToken.collateral,
          pair,
          slippageBps,
          swapWarningHandler: (message) => enqueueSnackbar({ message, type: 'warning' }),
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateLeverageParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentAll', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results
          destroySnackbar(loadingSnackbarId)
          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          enqueueSnackbar({ message: 'Borrowed successfully', type: 'success' })

          const { accountInfoByPubkey } = confirmed[0]
          if (!accountInfoByPubkey) return
          const { bondOffer, bondTradeTransaction, fraktBond } =
            parseTokenBorrowSimulatedAccounts(accountInfoByPubkey)
          const optimisticLoan: core.TokenLoan = {
            publicKey: fraktBond.publicKey,
            fraktBond: {
              ...fraktBond,
              hadoMarket: pair.marketPublicKey.toBase58(),
            },
            bondTradeTransaction,
            collateral: collateralToken.collateral,
            collateralPrice: collateralPriceFromConversionRate(
              collateralConversionRate,
              pair.marketTokenType,
            ),
            offerLtvBp: bnToNumberSafe(bondOffer.offerLtvBp),
            liquidationLtvBp: bnToNumberSafe(bondOffer.liquidationLtvBp),
          }

          //? The optimistic response from Oracle Offer returns `collateralsPerToken` as 0.
          //? To prevent calculation errors, we retrieve it from `selectedOffer` instead.
          const optimisticBondOffer = {
            ...bondOffer,
            validation: {
              ...bondOffer.validation,
              collateralsPerToken: selectedOffer?.collateralsPerToken || ZERO_BN,
            },
          }

          //? Add optimistic loans
          if (wallet.publicKey) {
            addLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
          }
          updateOrAddOptimisticOffer(optimisticBondOffer)
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          totalCollateralAmount: totalCollateralAmount.toString(),
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Multiply',
      })
    } finally {
      setBorrowBtnLoading(false)
    }
  }

  const borrowBtnProps: { text: string; disabled: boolean } = (() => {
    if (!wallet.connected)
      return {
        disabled: true,
        text: `Connect wallet`,
      }

    if (userEnteredCollateralAmount.lte(ZERO_BN))
      return {
        disabled: true,
        text: 'Enter collateral amount',
      }

    if (
      walletCollateralBalance.lt(stringToBN(collateralAmount, collateralToken.collateral.decimals))
    )
      return { disabled: true, text: 'Insufficient balance' }

    const totalBorrowAmount = calculateTokenLoanBorrowAmount(
      totalCollateralAmount.sub(userEnteredCollateralAmount),
      collateralConversionRate,
      getTokenDecimals(pair.marketTokenType),
      collateralToken.collateral.decimals,
    )

    if (pair.loanValueLimit && totalBorrowAmount.gt(pair.loanValueLimit)) {
      const unitSymbol = getTokenUnit(pair.marketTokenType)
      const limit = pair.loanValueLimit.div(new BN(10 ** getTokenDecimals(pair.marketTokenType)))
      return {
        disabled: true,
        text: `${limit} ${unitSymbol} limit reached`,
      }
    }

    if (!selectedOffer) {
      return {
        disabled: true,
        text: 'No liquidity',
      }
    }

    return {
      disabled: false,
      text: `Multiply ${pair.collateralTicker}`,
    }
  })()

  const openAppSettingsModal = () => {
    open(AppSettingsModal)
  }

  return {
    walletConnected: wallet.connected,
    slippage,
    openAppSettingsModal,

    collateralAmount,
    setCollateralAmount,

    walletCollateralBalance,
    totalCollateralAmount,

    multiplierValue,
    setMultiplierValue,

    simpleOffers,
    userEnteredCollateralAmount,
    offersLoading,
    selectedOffer,
    setSelectedOffer,

    collateralConversionRate,
    collateralPriceHuman, //? Depending on collateralConversionRate|isCollateralConversionRateLoading
    isCollateralConversionRateLoading,

    onLeverageBorrow,
    borrowBtnProps,
    borrowBtnLoading,
  }
}

export const useCollateralYield = (pair: MultiplyPair) => {
  const { data, isLoading } = useMultiplyMarketData(
    pair.marketPublicKey.toBase58(),
    pair.minPositionSize?.toNumber(),
  )

  const collateralYield = data?.maxNetApr ? new BN(data.maxNetApr * 100) : ZERO_BN

  return { collateralYield: collateralYield, isLoading }
}

export const useCollateralConversionRate = (params: {
  pair: MultiplyPair
  collateralDecimals?: number
  amount?: number //? collateral amount with decimals
  mode: 'leverage' | 'sellToRepay'
  connection: web3.Connection
  slippageBps: number
}) => {
  const { pair, collateralDecimals, amount, mode, connection, slippageBps } = params
  const { getNonJupLeverageConversionRate, getNonJupSellToRepayConversionRate } = pair

  const queryFn = useMemo(() => {
    if (mode === 'leverage' && getNonJupLeverageConversionRate) {
      return () => getNonJupLeverageConversionRate(connection)
    }
    if (mode === 'sellToRepay' && getNonJupSellToRepayConversionRate) {
      return () => getNonJupSellToRepayConversionRate(connection)
    }

    //? Fetch quote and convert to conversion rate

    if (!collateralDecimals) return null

    return () =>
      fetchConversionRate({
        pair,
        mode,
        tokenDecimals: collateralDecimals,
        slippageBps,
        amount,
      })
  }, [
    mode,
    getNonJupLeverageConversionRate,
    getNonJupSellToRepayConversionRate,
    collateralDecimals,
    pair,
    slippageBps,
    amount,
    connection,
  ])

  const { data: rate, isLoading } = useQuery({
    queryKey: ['conversionRate', pair, collateralDecimals, mode, slippageBps, amount],
    queryFn: () => queryFn!(),
    enabled: !!connection && !!queryFn,
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
  })

  return { rate: rate || 0, isLoading }
}

export const useMultiplyPair = (collateralMint: string) => {
  const customPair = useMemo(() => {
    return MULTIPLY_PAIRS.find(({ collateralMint: mint }) => mint.toBase58() === collateralMint)
  }, [collateralMint])

  const { tokenType } = useTokenType()

  const { collateralsList, isLoading: collateralsListLoading } = useCollateralsList(
    customPair?.marketTokenType,
  )

  const collateralToken: CollateralToken | undefined = useMemo(() => {
    if (!collateralMint || !collateralsList.length) return undefined

    return collateralsList.find((token) => token.collateral.mint === collateralMint)
  }, [collateralMint, collateralsList])

  const pair: MultiplyPair | undefined = useMemo(() => {
    if (!collateralToken) return undefined

    if (customPair) return customPair

    return createMultiplyPairFromCollateral(
      collateralToken.collateral,
      collateralToken.marketPubkey,
      tokenType,
    )
  }, [collateralToken, customPair, tokenType])

  return { pair, collateralToken, isLoading: collateralsListLoading }
}

export const useMultiplyMarketData = (marketPublicKey: string, minPositionSize = 0) => {
  const { data, isLoading } = useQuery({
    queryKey: ['fetchMultiplyMarketData', marketPublicKey, minPositionSize],
    queryFn: () => core.fetchMultiplyMarketData({ marketPubkey: marketPublicKey, minPositionSize }),
    enabled: !!marketPublicKey,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  })

  return { data, isLoading }
}
