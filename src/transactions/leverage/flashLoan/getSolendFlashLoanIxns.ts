import { BN, web3 } from 'fbonds-core'
import { solendFlashLoanUtils } from 'fbonds-core/lib/fbond-protocol'
import { WalletAndConnection } from 'solana-transactions-executor'

import { findAssociatedTokenAddress } from '@banx/transactions'

import { FlashLoanIxns } from './types'

/** In percents */
export const SOLEND_FLASH_BORROW_FEE = 0.1

type GetSolendFlashLoanIxns = (params: {
  tokenMint: string
  amount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<FlashLoanIxns>

export const getSolendFlashLoanIxns: GetSolendFlashLoanIxns = async ({
  tokenMint,
  amount,
  walletAndConnection,
}) => {
  const { wallet, connection } = walletAndConnection

  const solendMarket = await solendFlashLoanUtils.SolendMarket.initialize(connection)

  const reserve = solendMarket.reserves.find(
    ({ config }) => config.liquidityToken.mint === tokenMint,
  )
  if (reserve === null) {
    throw new Error('Solend market fetching error')
  }

  const lendingTokenAccount = findAssociatedTokenAddress(
    wallet.publicKey,
    new web3.PublicKey(tokenMint),
  )

  const flashBorrowIxn = solendFlashLoanUtils.flashBorrowReserveLiquidityInstruction(
    amount,
    new web3.PublicKey(reserve?.config.liquidityAddress),
    lendingTokenAccount,
    new web3.PublicKey(reserve?.config.address),
    new web3.PublicKey(solendMarket.config!.address),
  )

  const flashRepayIxn = solendFlashLoanUtils.flashRepayReserveLiquidityInstruction(
    amount,
    2,
    lendingTokenAccount,
    new web3.PublicKey(reserve?.config.liquidityAddress),
    new web3.PublicKey(reserve?.config.liquidityFeeReceiverAddress),
    lendingTokenAccount,
    new web3.PublicKey(reserve?.config.address),
    new web3.PublicKey(solendMarket.config!.address),
    wallet.publicKey,
  )

  return {
    flashBorrowIxns: [flashBorrowIxn],
    flashRepayIxns: [flashRepayIxn],
    feePercent: SOLEND_FLASH_BORROW_FEE,
  }
}
