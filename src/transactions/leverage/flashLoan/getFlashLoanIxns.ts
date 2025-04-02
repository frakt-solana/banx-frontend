import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { WalletAndConnection } from 'solana-transactions-executor'

import { USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'

import { getBanxSolFlashLoanIxns } from './getBanxSolFlashLoanIxns'
import { getSolendFlashLoanIxns } from './getSolendFlashLoanIxns'
import { FlashLoanIxns } from './types'

type FlashLoanProps = {
  amount: BN
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

type GetFlashLoanIxns = (params: FlashLoanProps) => Promise<FlashLoanIxns>

export const getFlashLoanIxns: GetFlashLoanIxns = async ({
  amount,
  tokenType,
  walletAndConnection,
}) => {
  const lendingTokenMint = tokenType === LendingTokenType.Usdc ? USDC_ADDRESS : WSOL_ADDRESS

  if (tokenType === LendingTokenType.Usdc) {
    return await getSolendFlashLoanIxns({
      tokenMint: lendingTokenMint,
      amount,
      walletAndConnection,
    })
  }

  return await getBanxSolFlashLoanIxns({
    amount,
    walletAndConnection,
  })
}
