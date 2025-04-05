import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { MIN_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { calcLenderTokenApr } from 'fbonds-core/lib/fbond-protocol/helpers'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createLoanListingSubscribeNotificationsContent,
  createLoanListingSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { CollateralToken } from '@banx/api'
import { PATHS, SECONDS_IN_DAY } from '@banx/constants'
import { getDialectAccessToken } from '@banx/providers/dialect'
import {
  buildUrlWithModeAndToken,
  useModal,
  useTokenLoanListingsOptimistic,
  useTokenType,
} from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateListTokenTxnDataParams,
  createListTokenTxnData,
  parseListTokenSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
} from '@banx/utils'

type UseListLoan = (params: {
  collateralToken: CollateralToken | undefined
  collateralAmount: number
  borrowAmount: number
  freezeDuration: number
  apr: number
  offerLtvBP: number
  liquidationLtvBP: number
}) => () => Promise<void>

export const useListLoan: UseListLoan = ({
  collateralToken,
  collateralAmount,
  borrowAmount,
  freezeDuration,
  apr,
  offerLtvBP,
  liquidationLtvBP,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const router = useRouter()
  const { tokenType } = useTokenType()

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { open: openModal, close: closeModal } = useModal()

  const { add: addLoansOptimistic } = useTokenLoanListingsOptimistic()

  const onBorrowSuccess = (loansAmount = 1) => {
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      openModal(SubscribeNotificationsModal, {
        title: createLoanListingSubscribeNotificationsTitle(loansAmount),
        message: createLoanListingSubscribeNotificationsContent(!isUserSubscribedToNotifications),
        onActionClick: !isUserSubscribedToNotifications
          ? () => {
              closeModal()
              setBanxNotificationsSiderVisibility(true)
            }
          : undefined,
        onCancel: closeModal,
      })
    }
  }

  const goToLoansPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LOANS, tokenType))
  }

  const listLoan = async () => {
    if (!collateralToken) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const marketTokenDecimals = getTokenDecimals(tokenType)

      const aprRate = calcLenderTokenApr(apr * 100, collateralToken.collateral.interestFee)

      const freezeDurationInSeconds = freezeDuration * SECONDS_IN_DAY

      const txnData = await createListTokenTxnData(
        {
          collateral: collateralToken,
          borrowAmount: borrowAmount * 10 ** marketTokenDecimals,
          collateralAmount: collateralAmount,
          freezeValue: freezeDurationInSeconds,
          aprRate: Math.max(aprRate, MIN_APR_SPL),
          offerLtvBP,
          liquidationLtvBP,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateListTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, signature, params }) => {
            enqueueSnackbar({
              message: 'Loan successfully listed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const accounts = parseListTokenSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                publicKey: accounts.fraktBond.publicKey,
                collateral: params.collateral.collateral,
                collateralPrice: params.collateral.collateralPrice,
                bondTradeTransaction: accounts.bondTradeTransaction,
                fraktBond: {
                  ...accounts.fraktBond,
                  hadoMarket: params.collateral.marketPubkey,
                  lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
                },
                offerLtvBp: params.offerLtvBP || 0,
                liquidationLtvBp: params.liquidationLtvBP || 0,
              }

              addLoansOptimistic([optimisticLoan], wallet.publicKey!.toBase58())
              goToLoansPage()
              onBorrowSuccess()
            }

            if (failed.length) {
              return failed.forEach(({ signature, reason }) =>
                enqueueConfirmationError(signature, reason),
              )
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
        walletPubkey: wallet.publicKey!.toBase58(),
        transactionName: 'ListTokenLoan',
      })
    }
  }

  return listLoan
}
