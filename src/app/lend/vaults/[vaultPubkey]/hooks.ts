import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import _ from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useUserEscrow } from '@banx/components/WalletAccountSidebar/components'

import { VaultPreview } from '@banx/api'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimRewardsFromPoolTxnDataParams,
  createClaimRewardsFromPoolTxnData,
  parseClaimRewardsFromPoolSimulatedAccounts,
} from '@banx/transactions/tokenLending/createClaimRewardsFromPoolTxnData'
import {
  CreateDepositLiquidityToPoolTxnDataParams,
  createDepositLiquidityToPoolTxnData,
  parseDepositLiquidityToPoolSimulatedAccounts,
} from '@banx/transactions/tokenLending/createDepositLiquidityToPoolTxnData'
import {
  CreateWithdrawLiquidityFromPoolTxnDataParams,
  createWithdrawLiquidityFromPoolTxnData,
  parseWithdrawLiquidityFromPoolSimulatedAccounts,
} from '@banx/transactions/tokenLending/createWithdrawLiquidityFromPoolTxnData'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'

import {
  updateClaimVaultPreviewOptimistic,
  updateDepositVaultPreviewOptimistic,
  updateWithdrawVaultPreviewOptimistic,
} from '../hooks'

export const useLiquidityPoolTxns = (vaultPreview: VaultPreview) => {
  const wallet = useWallet()
  const walletPubkey = wallet.publicKey?.toBase58() || ''

  const { connection } = useConnection()
  const { close: closeModal } = useModal()

  const { userEscrow, updateUserEscrowOptimistic } = useUserEscrow()

  const deposit = async ({ amount, onSuccess }: { amount: BN; onSuccess?: () => void }) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createDepositLiquidityToPoolTxnData(
        {
          amount,
          vaultPubkey: vaultPreview.vaultPubkey,
          lendingToken: vaultPreview.lendingToken,
          userEscrow,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateDepositLiquidityToPoolTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Deposit successfully',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const userEscrow = parseDepositLiquidityToPoolSimulatedAccounts(accountInfoByPubkey)
              if (userEscrow) {
                updateUserEscrowOptimistic({ walletPubkey, updatedUserEscrow: userEscrow })
              }

              updateDepositVaultPreviewOptimistic({
                vaultPubkey: vaultPreview.vaultPubkey,
                walletPubkey,
                amount,
              })
              onSuccess?.()
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
        walletPubkey,
        transactionName: 'DepositLiquidityToPool',
      })
    }
  }

  const withdraw = async ({ amount, onSuccess }: { amount: BN; onSuccess?: () => void }) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createWithdrawLiquidityFromPoolTxnData(
        {
          amount,
          vault: vaultPreview,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateWithdrawLiquidityFromPoolTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Request successfully initiated',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const userEscrow =
                parseWithdrawLiquidityFromPoolSimulatedAccounts(accountInfoByPubkey)

              if (userEscrow) {
                updateUserEscrowOptimistic({ walletPubkey, updatedUserEscrow: userEscrow })
              }

              updateWithdrawVaultPreviewOptimistic({
                vaultPubkey: vaultPreview.vaultPubkey,
                walletPubkey,
                amount,
              })
              onSuccess?.()
              closeModal()
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
        walletPubkey,
        transactionName: 'WithdrawLiquidityFromPool',
      })
    }
  }

  const claim = async (amount: BN) => {
    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimRewardsFromPoolTxnData(
        { vaultPubkey: vaultPreview.vaultPubkey, amount, lendingToken: vaultPreview.lendingToken },
        walletAndConnection,
      )

      await new TxnExecutor<CreateClaimRewardsFromPoolTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Claimed successfully',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const userEscrow = parseClaimRewardsFromPoolSimulatedAccounts(accountInfoByPubkey)
              if (userEscrow) {
                updateUserEscrowOptimistic({ walletPubkey, updatedUserEscrow: userEscrow })
              }

              updateClaimVaultPreviewOptimistic({
                vaultPubkey: vaultPreview.vaultPubkey,
                walletPubkey,
              })
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
        transactionName: 'claimRewardsFromPoolTxnData',
      })
    }
  }

  return {
    deposit,
    withdraw,
    claim,
  }
}
