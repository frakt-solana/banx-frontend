import { web3 } from 'fbonds-core'

export type FlashLoanIxns = {
  flashBorrowIxns: web3.TransactionInstruction[]
  flashRepayIxns: web3.TransactionInstruction[]
  feePercent: number
}
