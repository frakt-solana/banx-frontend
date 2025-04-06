import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { ResponseWithPagination } from '@banx/api/base'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  LoanSchema,
  LoansMarketSchema,
} from './schemas'

//? ========= Data types =========
export type FraktBond = z.infer<typeof FraktBondSchema>
export type BondTradeTransaction = z.infer<typeof BondTradeTransactionSchema>

export type Loan = z.infer<typeof LoanSchema>
export type LoansMarket = z.infer<typeof LoansMarketSchema>

//? ========= API function types =========
export type FetchBorrowerLoans = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<Loan[] | undefined>

export type FetchLenderLoans = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<Loan[] | undefined>

export type FetchLoansMarket = (props: {
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<LoansMarket | undefined>
export type LoansMarketResponse = ResponseWithPagination<LoansMarket>

export type FetchBorrowerLoanListings = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<Loan[] | undefined>
