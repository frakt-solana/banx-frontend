import { useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import _ from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useWalletBalance } from '@banx/hooks'
import { useTokenType } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateUpdateUserEscrowTxnDataParams,
  createUpdateUserEscrowTxnData,
  parseUpdateUserEscrowSimulatedAccounts,
} from '@banx/transactions/escrow'
import { ZERO_BN, stringToBN } from '@banx/utils/bn'
import { formatTrailingZeros } from '@banx/utils/common'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'
import { getTokenDecimals } from '@banx/utils/tokens'

import { getInputErrorMessage } from '../helpers'
import { useUserEscrowInfo } from './useUserEscrow'

export enum TabName {
  Wallet = 'wallet',
  Escrow = 'escrow',
}

export const useUserEscrowContent = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { userEscrowInfo, updateUserEscrowOptimistic } = useUserEscrowInfo()
  const walletBalance = useWalletBalance(tokenType)
  const escrowBalance = userEscrowInfo.offerLiquidityAmount

  const [activeTab, setActiveTab] = useState<TabName>(TabName.Wallet)
  const [inputValue, setInputValue] = useState('0')

  const tokenDecimals = getTokenDecimals(tokenType)

  const updateInputValue = (balance: number, shouldRound: boolean) => {
    const formattedBalance = balance / 10 ** tokenDecimals

    const formattedBalanceStr = shouldRound
      ? (Math.floor(formattedBalance * 100) / 100).toFixed(2)
      : formattedBalance.toString()

    setInputValue(formatTrailingZeros(formattedBalanceStr))
  }

  useEffect(() => {
    updateInputValue(walletBalance, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTabClick = (nextTab: TabName) => {
    setActiveTab(nextTab)

    const balance = nextTab === TabName.Wallet ? walletBalance : escrowBalance
    const shouldRound = nextTab === TabName.Wallet

    updateInputValue(balance, shouldRound)
  }

  const update = async (amount: BN) => {
    if (amount.lt(ZERO_BN)) return

    const loadingSnackbarId = _.uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUpdateUserEscrowTxnData(
        {
          amount,
          lendingTokenType: tokenType,
          add: activeTab === TabName.Wallet,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateUpdateUserEscrowTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({
              message:
                activeTab === TabName.Wallet ? 'Successfully deposited' : 'Successfully withdrawn',
              type: 'success',
            })

            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userEscrow = parseUpdateUserEscrowSimulatedAccounts(accountInfoByPubkey)

              updateUserEscrowOptimistic({
                walletPubkey: walletAndConnection.wallet.publicKey.toBase58(),
                updatedUserEscrow: userEscrow,
              })
            })
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
        additionalData: {
          amount: inputValue,
          lendingTokenType: tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateUserEscrow',
      })
    }
  }

  const onActionClick = () => {
    update(stringToBN(inputValue, tokenDecimals))
  }

  const errorMessage = getInputErrorMessage({
    activeTab,
    walletBalance,
    escrowBalance,
    inputValue,
    tokenType,
  })

  return {
    inputValue,
    setInputValue,

    activeTab,
    onTabClick,

    onActionClick,

    walletBalance,
    escrowBalance,

    errorMessage,
  }
}
