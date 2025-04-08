import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { useUserEscrow } from '@banx/components/WalletAccountSidebar'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api'
import { getDialectAccessToken } from '@banx/providers/dialect'
import { useIsLedger, useModal } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateLendToBorrowTokenTxnDataParams,
  createBulkLendToBorrowTokenTxnsData,
} from '@banx/transactions/tokenLending'
import { isLoanListed } from '@banx/utils/core'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'

import { useMarketLoansData } from './useMarketLoansData'
import { useMarketLoansState } from './useMarketLoansState'

export const useMarketLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { userEscrow } = useUserEscrow()

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { addLoansPubkeys } = useMarketLoansData()
  const { open, close } = useModal()

  const { selection, clear: clearSelection, remove: removeSelection } = useMarketLoansState()

  const onSuccess = (loansAmount: number) => {
    if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
      open(SubscribeNotificationsModal, {
        title: createRefinanceSubscribeNotificationsTitle(loansAmount),
        message: createRefinanceSubscribeNotificationsContent(),
        onActionClick: () => {
          close()
          setBanxNotificationsSiderVisibility(true)
        },
        onCancel: close,
      })
    } else {
      //? Close warning modal
      close()
    }
  }

  const lendToBorrow = async (loan: Loan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const [txnData] = await createBulkLendToBorrowTokenTxnsData(
        { loans: [loan], userEscrow },
        walletAndConnection,
      )

      await new TxnExecutor<CreateLendToBorrowTokenTxnDataParams>(
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

          if (confirmed.length) {
            return confirmed.forEach(({ params, signature }) => {
              const isOldLoanListed = isLoanListed(params.loan)

              const message = isOldLoanListed
                ? 'Loan successfully funded'
                : 'Loan successfully refinanced'

              enqueueSnackbar({
                message,
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              addLoansPubkeys([loan.publicKey])
              removeSelection(loan.publicKey)
              onSuccess(1)
            })
          }
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
        transactionName: 'LendToBorrowToken',
      })
    }
  }

  const lendToBorrowAll = async (loans: Loan[]) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await createBulkLendToBorrowTokenTxnsData(
        { loans: loans, userEscrow },
        walletAndConnection,
      )

      await new TxnExecutor<CreateLendToBorrowTokenTxnDataParams>(walletAndConnection, {
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
            enqueueSnackbar({ message: 'Loans successfully funded', type: 'success' })

            const pubkeysToHidden = chain(confirmed)
              .map(({ params }) => params.loan.publicKey)
              .compact()
              .value()

            addLoansPubkeys(pubkeysToHidden)
            clearSelection()
            onSuccess(pubkeysToHidden.length)
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
        additionalData: selection,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'LendToBorrowAllToken',
      })
    }
  }

  return {
    lendToBorrow,
    lendToBorrowAll,
  }
}
