import axios from 'axios'

import { convertToMarketType, parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { TokenLoanAuctionsAndListingsSchema, TokenLoanSchema } from './schemas'
import {
  FetchTokenLenderLoans,
  FetchTokenLoanAuctionsAndListings,
  FetchUserTokenLoanListings,
  FetchWalletTokenLoansAndOffers,
  TokenLoan,
  TokenLoanAuctionsAndListings,
  TokenLoanAuctionsAndListingsResponse,
} from './types'

export const fetchWalletTokenLoansAndOffers: FetchWalletTokenLoansAndOffers = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower-v2/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data?.data, TokenLoanSchema.array())
}

export const fetchTokenLenderLoans: FetchTokenLenderLoans = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}

export const fetchTokenLoanAuctionsAndListings: FetchTokenLoanAuctionsAndListings = async ({
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<TokenLoanAuctionsAndListingsResponse>(
    `${BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoanAuctionsAndListings>(
    data.data,
    TokenLoanAuctionsAndListingsSchema,
  )
}

export const fetchUserTokenLoanListings: FetchUserTokenLoanListings = async ({
  walletPubkey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower-requests/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}
