import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { every, uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { TokenLoan } from '@banx/api/tokens'
import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { useTokenLoansOptimistic } from '@banx/store'
import { useIsLedger, useModal, useSlippage } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateSellToRepayTokenLoanTxnDataParams,
  parseSellToRepayTokenLoanSimulatedAccounts,
} from '@banx/transactions/leverage/common/createSellToRepayTokenLoanTxnData'
import {
  CreateCollateralSupplyTxnDataParams,
  CreateRepayPartialTokenLoanTxnDataParams,
  CreateRepayTokenLoanTxnDataParams,
  createCollateralSupplyTxnData,
  createRepayPartialTokenLoanTxnData,
  createRepayTokenLoanTxnData,
  parseCollateralSupplySimulatedAccounts,
  parseRepayLoanSimulatedAccounts,
  parseRepayPartialLoanSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { caclFractionToRepay, caclFractionToRepayForRepaymentCall } from '../helpers'
import { useSelectedTokenLoans } from '../loansCart'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()
  const { slippageBps } = useSlippage()

  const { close } = useModal()

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()
  const { selection, clear: clearSelection } = useSelectedTokenLoans()

  const repayLoan = async (loan: TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await createRepayTokenLoanTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateRepayTokenLoanTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnsData)
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

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Repaid successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondTradeTransaction, fraktBond } =
                parseRepayLoanSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(
                params.loan,
                fraktBond,
                bondTradeTransaction,
              )

              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
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
        transactionName: 'RepayTokenLoan',
      })
    }
  }

  const repayAllLoans = async () => {
    const loadingSnackbarId = uniqueId()

    const selectedLoans = selection.map((loan) => loan.loan)

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) => createRepayTokenLoanTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateRepayTokenLoanTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 1 : 40,
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
            enqueueSnackbar({ message: 'Loans successfully repaid', type: 'success' })

            confirmed.forEach(({ params, accountInfoByPubkey }) => {
              if (accountInfoByPubkey && wallet.publicKey) {
                const { bondTradeTransaction, fraktBond } =
                  parseRepayLoanSimulatedAccounts(accountInfoByPubkey)

                const optimisticLoan = createOptimisticLoan(
                  params.loan,
                  fraktBond,
                  bondTradeTransaction,
                )

                updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              }
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
        additionalData: selectedLoans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayAllTokenLoans',
      })
    }
  }

  const repayPartialLoan = async (loan: TokenLoan, fractionToRepay: number) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepayPartialTokenLoanTxnData(
        { loan, fractionToRepay },
        walletAndConnection,
      )

      await new TxnExecutor<CreateRepayPartialTokenLoanTxnDataParams>(
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

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Paid successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondTradeTransaction, fraktBond } =
                parseRepayPartialLoanSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(
                params.loan,
                fraktBond,
                bondTradeTransaction,
              )

              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
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
        transactionName: 'RepayPartialTokenLoan',
      })
    }
  }

  const repayUnpaidLoansInterest = async () => {
    const loadingSnackbarId = uniqueId()

    const loansWithCalculatedUnpaidInterest = selection
      .map(({ loan }) => ({
        loan,
        fractionToRepay: isTokenLoanRepaymentCallActive(loan)
          ? caclFractionToRepayForRepaymentCall(loan)
          : caclFractionToRepay(loan),
      }))
      .filter(({ fractionToRepay }) => fractionToRepay >= 1)

    const allLoansAreWithoutRepaymentCall = every(
      selection,
      ({ loan }) => !isTokenLoanRepaymentCallActive(loan),
    )

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loansWithCalculatedUnpaidInterest.map(({ loan, fractionToRepay }) =>
          createRepayPartialTokenLoanTxnData({ loan, fractionToRepay }, walletAndConnection),
        ),
      )

      await new TxnExecutor<CreateRepayPartialTokenLoanTxnDataParams>(walletAndConnection, {
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
            const message = allLoansAreWithoutRepaymentCall
              ? 'Loans interest successfully paid'
              : 'Paid successfully'

            enqueueSnackbar({ message, type: 'success' })

            confirmed.forEach(({ params, accountInfoByPubkey }) => {
              if (accountInfoByPubkey && wallet.publicKey) {
                const { bondTradeTransaction, fraktBond } =
                  parseRepayPartialLoanSimulatedAccounts(accountInfoByPubkey)

                const optimisticLoan = createOptimisticLoan(
                  params.loan,
                  fraktBond,
                  bondTradeTransaction,
                )

                updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              }
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
        additionalData: loansWithCalculatedUnpaidInterest,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayUnpaidTokenLoansInterest',
      })
    }
  }

  const sellToRepay = async (params: {
    loan: TokenLoan
    pair: MultiplyPair
    expectedCollateralConversionRate?: number
    onSuccess?: () => void
  }) => {
    const { loan, pair, expectedCollateralConversionRate, onSuccess } = params

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await pair.createSellToRepayTxnHandler(
        {
          loan,
          pair,
          expectedCollateralConversionRate,
          slippageBps,
          swapWarningHandler: (message) => enqueueSnackbar({ message, type: 'warning' }),
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateSellToRepayTokenLoanTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnsData)
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

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Loan sold successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondTradeTransaction, fraktBond } =
                parseSellToRepayTokenLoanSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(
                params.loan,
                fraktBond,
                bondTradeTransaction,
              )

              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
              close()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()

      onSuccess?.()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'SellToRepay',
      })
    }
  }

  const supplyCollateral = async (loan: TokenLoan, collateralAmount: BN) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })
      const txnsData = await createCollateralSupplyTxnData(
        { loan, collateralAmount },
        walletAndConnection,
      )

      await new TxnExecutor<CreateCollateralSupplyTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnsData)
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

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Collateral supplied successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondTradeTransaction, fraktBond } =
                parseCollateralSupplySimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan(
                params.loan,
                fraktBond,
                bondTradeTransaction,
              )

              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
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
        transactionName: 'SupplyCollateral',
      })
    }
  }

  return {
    repayLoan,
    repayAllLoans,
    repayPartialLoan,
    repayUnpaidLoansInterest,
    sellToRepay,
    supplyCollateral,
  }
}

const createOptimisticLoan = (
  loan: TokenLoan,
  newFraktBond: TokenLoan['fraktBond'],
  newBondTradeTransaction: TokenLoan['bondTradeTransaction'],
): TokenLoan => {
  const currentTimeInSeconds = moment().unix()

  return {
    ...loan,
    publicKey: newFraktBond.publicKey,
    fraktBond: {
      ...newFraktBond,
      lastTransactedAt: currentTimeInSeconds, //? Needs to prevent BE data overlap in optimistics logic
      hadoMarket: loan.fraktBond.hadoMarket,
    },
    bondTradeTransaction: newBondTradeTransaction,
  }
}
