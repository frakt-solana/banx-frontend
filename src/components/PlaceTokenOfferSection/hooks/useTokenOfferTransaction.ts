import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BondFeatures, BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { useUserEscrow } from '@banx/components/WalletAccountSidebar'

import { convertBondOfferV3ToCore } from '@banx/api'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateMakeBondingOfferTxnDataParams,
  CreateRemoveOfferTxnDataParams,
  CreateUpdateBondingOfferTxnDataParams,
  createMakeBondingOfferTxnData,
  createRemoveOfferTxnData,
  createUpdateBondingOfferTxnData,
  parseMakeTokenOfferSimulatedAccounts,
  parseRemoveTokenOfferSimulatedAccounts,
  parseUpdateTokenOfferSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'
import { getTokenDecimals } from '@banx/utils/tokens'

export const useTokenOfferTransactions = ({
  offer,
  marketPubkey,
  apr,
  loanValue,
  collateralsPerToken,
  offerLtv,
  liquidationLtv,
  lendingToken,
  updateOrAddOffer,
  resetForm,
}: {
  marketPubkey: string
  offer: BondOfferV3 | undefined
  apr: number
  loanValue: number
  collateralsPerToken: number
  offerLtv: number
  liquidationLtv: number
  lendingToken: LendingTokenType

  updateOrAddOffer: (offer: BondOfferV3) => void
  resetForm: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { userEscrow } = useUserEscrow()
  const { close: closeModal } = useModal()

  const lendingTokenDecimals = getTokenDecimals(lendingToken)

  const createOffer = async (depositAmountToVault?: BN) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const params = {
        marketPubkey,
        loansAmount: 1, //? Always 1 for token lending
        loanValue: loanValue * 10 ** lendingTokenDecimals,
        collateralsPerToken: new BN(Math.floor(collateralsPerToken).toString()),
        tokenLendingApr: apr * 100,
        offerLtvBP: new BN(offerLtv * 100),
        liquidationLtvBP: new BN(liquidationLtv * 100),
        bondFeature: BondFeatures.AutoReceiveAndReceiveSpl,
        escrowBalance: userEscrow?.offerLiquidityAmount,
        depositAmountToVault,
        tokenType: lendingToken,
      }

      const txnData = await createMakeBondingOfferTxnData(params, walletAndConnection)

      await new TxnExecutor<CreateMakeBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully placed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseMakeTokenOfferSimulatedAccounts(accountInfoByPubkey)
              updateOrAddOffer(offer)
              resetForm()
            }

            closeModal()
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { marketPubkey, loanValue },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'CreateTokenOffer',
      })
    }
  }

  const updateOffer = async (depositAmountToVault?: BN) => {
    if (!offer) return

    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const params = {
        offer: convertBondOfferV3ToCore(offer),
        loansAmount: 1, //? Always 1 for token lending
        loanValue: loanValue * 10 ** lendingTokenDecimals,
        tokenType: lendingToken,
        collateralsPerToken: new BN(Math.floor(collateralsPerToken).toString()),
        tokenLendingApr: apr * 100,
        offerLtvBP: new BN(offerLtv * 100),
        liquidationLtvBP: new BN(liquidationLtv * 100),
        escrowBalance: userEscrow?.offerLiquidityAmount,
        depositAmountToVault,
      }

      const txnData = await createUpdateBondingOfferTxnData(params, walletAndConnection)

      await new TxnExecutor<CreateUpdateBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Changes successfully applied',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })
            if (accountInfoByPubkey) {
              const offer = parseUpdateTokenOfferSimulatedAccounts(accountInfoByPubkey)
              //? Needs to prevent BE data overlap in optimistics logic
              updateOrAddOffer({ ...offer, lastTransactedAt: new BN(moment().unix()) })
            }

            closeModal()
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { loanValue, offer: offer },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateTokenOffer',
      })
    }
  }

  const removeOffer = async () => {
    if (!offer) return

    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRemoveOfferTxnData(
        { offer: convertBondOfferV3ToCore(offer) },
        walletAndConnection,
      )

      await new TxnExecutor<CreateRemoveOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully removed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseRemoveTokenOfferSimulatedAccounts(accountInfoByPubkey)
              //? Needs to prevent BE data overlap in optimistics logic
              updateOrAddOffer({ ...offer, lastTransactedAt: new BN(moment().unix()) })
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { offer: offer },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RemoveTokenOffer',
      })
    }
  }

  return {
    createOffer,
    updateOffer,
    removeOffer,
  }
}
