import { useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import _ from 'lodash'
import { useRouter } from 'next/navigation'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { CollateralToken } from '@banx/api'
import { PATHS } from '@banx/constants'
import { getDialectAccessToken } from '@banx/providers/dialect'
import {
  buildUrlWithModeAndToken,
  useModal,
  useTokenLoansOptimistic,
  useTokenType,
} from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowTokenTxnDataParams,
  createBorrowSplTokenTxnData,
  parseTokenBorrowSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'

import { BorrowOffer } from './useBorrowOffers'

export const useBorrowOffersTransaction = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const router = useRouter()
  const { open, close } = useModal()
  const { tokenType } = useTokenType()

  const { add: addLoansOptimistic } = useTokenLoansOptimistic()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const [isBorrowing, setIsBorrowing] = useState(false)

  const goToLoansPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LOANS, tokenType))
  }

  const onBorrowSuccess = (loansAmount = 1) => {
    //? Show notification with an offer to subscribe (if user not subscribed)
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(loansAmount),
        message: createLoanSubscribeNotificationsContent(!isUserSubscribedToNotifications),
        onActionClick: !isUserSubscribedToNotifications
          ? () => {
              close()
              setBanxNotificationsSiderVisibility(true)
            }
          : undefined,
        onCancel: close,
      })
    }
  }

  const borrow = async (offer: BorrowOffer, collateral: CollateralToken) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      setIsBorrowing(true)

      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowSplTokenTxnData(
        {
          offer,
          collateral,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateBorrowTokenTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', () => {
          enqueueTransactionsSent()
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

          return confirmed.forEach((txnResult) => {
            const { accountInfoByPubkey, params } = txnResult

            enqueueSnackbar({ message: 'Borrowed successfully', type: 'success' })

            if (!accountInfoByPubkey) return

            const { bondTradeTransaction, fraktBond } =
              parseTokenBorrowSimulatedAccounts(accountInfoByPubkey)

            const optimisticLoan = {
              publicKey: fraktBond.publicKey,
              fraktBond: {
                ...fraktBond,
                hadoMarket: params.collateral.marketPubkey,
              },
              bondTradeTransaction,
              collateral: params.collateral.collateral,
              collateralPrice: params.collateral.collateralPrice,
              offerLtvBp: offer.offerLtvBp,
              liquidationLtvBp: offer.liquidationLtvBp,
            }

            addLoansOptimistic([optimisticLoan], wallet.publicKey!.toBase58())
            goToLoansPage()
            onBorrowSuccess()
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'BorrowSplToken',
      })
    } finally {
      setIsBorrowing(false)
    }
  }

  return { borrow, isBorrowing }
}
