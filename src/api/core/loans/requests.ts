import axios from 'axios'

import { convertToMarketType, parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { LoansMarketSchema, TokenLoanSchema } from './schemas'
import {
  FetchBorrowerLoanListings,
  FetchBorrowerLoans,
  FetchLenderLoans,
  FetchLoansMarket,
  LoansMarket,
  LoansMarketResponse,
  TokenLoan,
} from './types'

export const fetchBorrowerLoans: FetchBorrowerLoans = async ({
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

export const fetchBorrowerLoanListings: FetchBorrowerLoanListings = async ({
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

export const fetchLenderLoans: FetchLenderLoans = async ({
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

export const fetchLoansMarket: FetchLoansMarket = async ({ tokenType, getAll = true }) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<LoansMarketResponse>(
    `${BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
  )

  return await parseResponseSafe<LoansMarket>(data.data, LoansMarketSchema)
}
