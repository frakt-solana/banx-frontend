import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { ResponseWithPagination } from '@banx/api/shared'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  TokenLoanAuctionsAndListingsSchema,
  TokenLoanSchema,
} from './schemas'

//? ========= Data types =========
export type FraktBond = z.infer<typeof FraktBondSchema>
export type BondTradeTransaction = z.infer<typeof BondTradeTransactionSchema>

export type TokenLoan = z.infer<typeof TokenLoanSchema>
export type TokenLoanAuctionsAndListings = z.infer<typeof TokenLoanAuctionsAndListingsSchema>

//? ========= API function types =========
export type FetchWalletTokenLoansAndOffers = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export type FetchTokenLenderLoans = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export type FetchTokenLoanAuctionsAndListings = (props: {
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoanAuctionsAndListings | undefined>

export type FetchUserTokenLoanListings = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export type TokenLoanAuctionsAndListingsResponse =
  ResponseWithPagination<TokenLoanAuctionsAndListings>
