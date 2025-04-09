import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan, convertBondOfferV3ToCore } from '@banx/api'
import { useIsLedger, useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimTokenTxnDataParams,
  CreateInstantRefinanceTokenTxnDataParams,
  CreateRepaymentCallTokenTxnDataParams,
  CreateRevertTerminateTokenTxnDataParams,
  CreateTerminateTokenTxnDataParams,
  createClaimTokenTxnData,
  createInstantRefinanceTokenTxnData,
  createRepaymentCallTokenTxnData,
  createRevertTerminationTokenTxnData,
  createTerminateTokenTxnData,
  parseInstantRefinanceTokenSimulatedAccounts,
  parseRepaymentCallSimulatedAccounts,
  parseTerminateSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import { caclulateBorrowTokenLoanValue } from '@banx/utils/core'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'

import { useLenderLoansData } from './useLenderLoansData'
import { useLenderLoansState } from './useLenderLoansState'

export const useLenderLoansTxns = () => {
  const wallet = useWallet()
  const { isLedger } = useIsLedger()
  const { connection } = useConnection()

  const { addLoansPubkeys, updateOrAddLoan } = useLenderLoansData()
  const { clear: clearSelection, remove: removeLoan } = useLenderLoansState()

  const { close } = useModal()

  const terminateTokenLoan = async (loan: Loan, startLiquidation?: boolean) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createTerminateTokenTxnData(
        { loan, startLiquidation },
        walletAndConnection,
      )

      await new TxnExecutor<CreateTerminateTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, params, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              const messageText = startLiquidation
                ? 'Loan successfully terminated'
                : 'Loan successfully listed'

              enqueueSnackbar({
                message: messageText,
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(loan, fraktBond, bondTradeTransaction)
              updateOrAddLoan(optimisticLoan)

              removeLoan(loan.publicKey, wallet.publicKey.toBase58())
              close()
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
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Terminate',
      })
    }
  }

  const revertTerminateTokenLoan = async (loan: Loan) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRevertTerminationTokenTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateRevertTerminateTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, params, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully delisted',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(loan, fraktBond, bondTradeTransaction)
              updateOrAddLoan(optimisticLoan)

              removeLoan(loan.publicKey, wallet.publicKey.toBase58())
              close()
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
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RevertTokenLoan',
      })
    }
  }

  const terminateTokenLoans = async (loans: Loan[]) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loans.map((loan) => createTerminateTokenTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateTerminateTokenTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Collaterals successfully terminated', type: 'success' })
            confirmed.forEach(({ accountInfoByPubkey, params }) => {
              if (!accountInfoByPubkey) return

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(loan, fraktBond, bondTradeTransaction)
              updateOrAddLoan(optimisticLoan)
            })

            clearSelection()
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'TerminateTokenLoans',
      })
    }
  }

  const instantTokenLoan = async (
    loan: Loan,
    bestOffer: BondOfferV3,
    updateOrAddOffer: (offer: BondOfferV3) => void,
  ) => {
    if (!bestOffer) return

    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = loan.bondTradeTransaction.amountOfBonds

      const txnData = await createInstantRefinanceTokenTxnData(
        { loan, bestOffer: convertBondOfferV3ToCore(bestOffer), aprRate },
        walletAndConnection,
      )

      await new TxnExecutor<CreateInstantRefinanceTokenTxnDataParams>(
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
            if (accountInfoByPubkey) {
              enqueueSnackbar({
                message: 'Offer successfully sold',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const offer = parseInstantRefinanceTokenSimulatedAccounts(accountInfoByPubkey)

              updateOrAddOffer(offer)
              addLoansPubkeys([loan.publicKey])
              close()
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
        additionalData: { bestOffer, loan },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceInstant',
      })
    }
  }

  const claimTokenLoans = async (loans: Loan[]) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loans.map((loan) => createClaimTokenTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateClaimTokenTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Collaterals successfully claimed', type: 'success' })

            const mintsToHidden = _.chain(confirmed)
              .map(({ params }) => params.loan.publicKey)
              .compact()
              .value()

            addLoansPubkeys(mintsToHidden)
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimTokenLoans',
      })
    }
  }

  const claimTokenLoan = async (loan: Loan) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimTokenTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateClaimTokenTxnDataParams>(
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

          return confirmed.forEach(({ params, signature }) => {
            enqueueSnackbar({
              message: 'Collateral successfully claimed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            addLoansPubkeys([params.loan.publicKey])
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimTokenLoan',
      })
    }
  }

  const sendRepaymentCall = async (loan: Loan, repayPercent: number) => {
    const callAmount = Math.floor(
      (caclulateBorrowTokenLoanValue(loan).toNumber() * repayPercent) / 100,
    )

    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepaymentCallTokenTxnData(
        { loan, callAmount },
        walletAndConnection,
      )

      await new TxnExecutor<CreateRepaymentCallTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, params, signature }) => {
            if (accountInfoByPubkey) {
              enqueueSnackbar({
                message: 'Repayment call initialized',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { loan } = params
              const bondTradeTransaction = parseRepaymentCallSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(
                loan,
                loan.fraktBond,
                bondTradeTransaction,
              )

              updateOrAddLoan(optimisticLoan)
              close()
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
        additionalData: { loan, callAmount },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepaymentCallToken',
      })
    }
  }

  return {
    claimTokenLoan,
    claimTokenLoans,
    instantTokenLoan,
    terminateTokenLoan,
    terminateTokenLoans,
    revertTerminateTokenLoan,
    sendRepaymentCall,
  }
}

const createOptimisticLoan = (
  loan: Loan,
  newFraktBond: Loan['fraktBond'],
  newBondTradeTransaction: Loan['bondTradeTransaction'],
): Loan => {
  const currentTimeInSeconds = moment().unix()

  const optimisticLoan = {
    ...loan,
    fraktBond: {
      ...newFraktBond,
      lastTransactedAt: currentTimeInSeconds, //? Needs to prevent BE data overlap in optimistics logic
      hadoMarket: loan.fraktBond.hadoMarket,
    },
    bondTradeTransaction: newBondTradeTransaction,
  }

  return optimisticLoan
}
