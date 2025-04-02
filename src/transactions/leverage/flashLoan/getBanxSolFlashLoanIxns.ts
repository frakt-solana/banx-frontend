import { BN } from 'fbonds-core'
import {
  flashLoanBanxSolEnd,
  flashLoanSolBegin,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { WalletAndConnection } from 'solana-transactions-executor'

import { sendTxnPlaceHolder } from '@banx/transactions'

import { FlashLoanIxns } from './types'

type GetBanxSolFlashLoanIxns = (params: {
  amount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<FlashLoanIxns>

export const getBanxSolFlashLoanIxns: GetBanxSolFlashLoanIxns = async ({
  amount,
  walletAndConnection,
}) => {
  const { wallet, connection } = walletAndConnection

  const { instructions: flashBorrowIxns } = await flashLoanSolBegin({
    accounts: {
      userPubkey: wallet.publicKey,
    },
    args: {
      amount: amount,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const { instructions: flashRepayIxns } = await flashLoanBanxSolEnd({
    accounts: {
      userPubkey: wallet.publicKey,
    },
    args: {
      amount: amount,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    flashBorrowIxns,
    flashRepayIxns,
    feePercent: 0,
  }
}
