import { QuoteResponse, SwapApi, createJupiterApiClient } from '@jup-ag/api'
import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { sellToRepay } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond, Loan } from '@banx/api'
import { DEFAULT_JUP_QUOTE_PARAMS } from '@banx/api/common'
import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { BONDS, USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { parseAccountInfoByPubkey, sendTxnPlaceHolder } from '@banx/transactions'
import { getJupSwapIxns } from '@banx/transactions/jup'
import { createRepayTokenLoanTxnData } from '@banx/transactions/tokenLending'
import { caclulateBorrowTokenLoanValue } from '@banx/utils/core'
import { isBanxSolTokenType } from '@banx/utils/tokens'

export type CreateSellToRepayTokenLoanTxnDataParams = {
  loan: Loan
  pair: MultiplyPair
  expectedCollateralConversionRate?: number //? Used for lrtsSOL swap
  slippageBps: number
  swapWarningHandler?: (message: string) => void
}

export type CreateSellToRepayTokenLoanTxnData = (
  params: CreateSellToRepayTokenLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateSellToRepayTokenLoanTxnDataParams>>

export const createSellToRepayTokenLoanTxnData: CreateSellToRepayTokenLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, pair, slippageBps, swapWarningHandler } = params
  const { bondTradeTransaction, fraktBond } = loan
  const { wallet, connection } = walletAndConnection

  const { instructions: sellToRepayInstructions } = await sellToRepay({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(loan.collateral.mint),
    },
    args: {
      amountToSell: new BN(fraktBond.fbondTokenSupply.toString()),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const jupiterClient = createJupiterApiClient()

  const resultQuote = await fetchBestJupiterQuote({
    loan,
    pair,
    jupiterClient,
    slippageBps,
    swapWarningHandler,
  })

  if (!resultQuote) {
    throw new Error('No route found for either ExactOut or ExactIn modes.')
  }

  const { instructions: jupiterSwapInstructions, lookupTables: jupiterLookupTables } =
    await getJupSwapIxns({
      jupiterQuoteApi: jupiterClient,
      quote: resultQuote,
      walletPublicKey: wallet.publicKey,
    })

  const { instructions: repayLoanInstructions, accounts: repayTokenLoanAccounts } =
    await createRepayTokenLoanTxnData({ loan }, walletAndConnection)

  return {
    params,
    accounts: repayTokenLoanAccounts,
    instructions: [
      ...sellToRepayInstructions,
      ...jupiterSwapInstructions,
      ...repayLoanInstructions,
    ],
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE), ...jupiterLookupTables],
  }
}

export const parseSellToRepayTokenLoanSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}

type FetchQuoteProps = (props: {
  loan: Loan
  pair: MultiplyPair
  jupiterClient: SwapApi
  slippageBps: number
  swapWarningHandler?: (message: string) => void
}) => Promise<QuoteResponse | null>

const fetchBestJupiterQuote: FetchQuoteProps = async (props) => {
  const exactOutQuote = await fetchExactOutQuote(props)

  if (exactOutQuote) {
    const canSatisfy = canSatisfyExactOutCollateral(exactOutQuote, props.loan)

    if (canSatisfy) {
      return exactOutQuote
    } else {
      props.swapWarningHandler?.('Exact swap not found. Trying to find the closest...')
    }
  }

  const exactInQuote = await fetchExactInQuote(props)
  if (exactInQuote) {
    return exactInQuote
  }

  return null
}

const fetchExactOutQuote: FetchQuoteProps = async (props) => {
  const { loan, pair, jupiterClient, slippageBps } = props
  const { bondTradeTransaction, fraktBond, collateralPrice, collateral } = loan

  try {
    const lendingTokenMint = selectMintByLendingToken(bondTradeTransaction.lendingToken)

    const totalCollateralSupply = fraktBond.fbondTokenSupply
    const totalCollateralValue =
      totalCollateralSupply * (collateralPrice / 10 ** collateral.decimals)

    const totalLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
    const amountToSwap = Math.trunc(Math.min(totalCollateralValue, totalLoanDebt))

    return await jupiterClient.quoteGet({
      inputMint: collateral.mint,
      outputMint: lendingTokenMint,
      amount: amountToSwap,
      slippageBps,
      swapMode: 'ExactOut',
      ...DEFAULT_JUP_QUOTE_PARAMS,
      ...pair.customSellToRepayQuoteParams?.exactOut,
    })
  } catch (error) {
    console.error('Error while fetching ExactOut quote:', error)
    return null
  }
}

const fetchExactInQuote: FetchQuoteProps = async (props) => {
  const { loan, pair, jupiterClient, slippageBps } = props
  const { fraktBond, bondTradeTransaction, collateralPrice, collateral } = loan

  try {
    const lendingTokenMint = selectMintByLendingToken(bondTradeTransaction.lendingToken)

    const totalCollateralSupply = fraktBond.fbondTokenSupply
    const totalLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()

    const collateralNeededToRepay = (totalLoanDebt / collateralPrice) * 10 ** collateral.decimals

    const amountToSwap = Math.min(totalCollateralSupply, Math.round(collateralNeededToRepay))

    return await jupiterClient.quoteGet({
      inputMint: collateral.mint,
      outputMint: lendingTokenMint,
      amount: amountToSwap,
      slippageBps,
      swapMode: 'ExactIn',
      ...DEFAULT_JUP_QUOTE_PARAMS,
      ...pair.customSellToRepayQuoteParams?.exactIn,
    })
  } catch (error) {
    console.error('Error while fetching ExactIn quote:', error)
    return null
  }
}

/**
 * Checks if the user has enough collateral to satisfy the ExactOut quote requirements.
 * @returns {boolean} - True if the user has enough collateral, otherwise false.
 */
const canSatisfyExactOutCollateral = (quote: QuoteResponse, loan: Loan): boolean => {
  const userCollateralSupply = loan.fraktBond.fbondTokenSupply

  const routeItem = quote.routePlan?.[0]
  if (!routeItem?.swapInfo) return false

  const inAmount = Number(routeItem.swapInfo.inAmount) //? Amount of input collateral required for the swap.
  const feeAmount = Number(routeItem.swapInfo.feeAmount) //? Transaction fees for the swap.

  const totalNeeded = inAmount + feeAmount

  //? Check if the user's collateral supply is sufficient.
  if (totalNeeded <= userCollateralSupply) {
    return true
  }

  return false
}

const selectMintByLendingToken = (lendingToken: LendingTokenType): string =>
  isBanxSolTokenType(lendingToken) ? WSOL_ADDRESS : USDC_ADDRESS
