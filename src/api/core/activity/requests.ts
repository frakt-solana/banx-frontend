import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ResponseWithPagination } from '@banx/api/base'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../shared'
import { BorrowerActivitySchema, LenderActivitySchema } from './schemas'
import {
  BorrowerActivity,
  FetchBorrowerActivity,
  FetchLenderActivity,
  LenderActivity,
} from './types'

export const fetchLenderActivity: FetchLenderActivity = async ({
  walletPubkey,
  tokenType,
  order = 'desc',
  state = 'all',
  sortBy,
  skip = 0,
  limit = 10,
  collection,
  getAll = false,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    sortBy,
    state,
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (collection?.length) queryParams.append('collection', String(collection))

  const { data } = await axios.get<ResponseWithPagination<LenderActivity>>(
    `${BACKEND_BASE_URL}/spl-activity/lender/${walletPubkey}?${queryParams.toString()}`,
  )

  return LenderActivitySchema.array().parseAsync(data.data)
}

export const fetchBorrowerActivity: FetchBorrowerActivity = async ({
  walletPubkey,
  tokenType,
  order = 'desc',
  sortBy,
  state = 'all',
  skip = 0,
  limit = 10,
  getAll = false,
  collection,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    sortBy,
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    state,
  })

  if (collection?.length) queryParams.append('collection', String(collection))

  const { data } = await axios.get<ResponseWithPagination<BorrowerActivity[]>>(
    `${BACKEND_BASE_URL}/spl-activity/borrower/${walletPubkey}?${queryParams.toString()}`,
  )

  return BorrowerActivitySchema.array().parseAsync(data.data)
}

export const fetchBorrowerActivityCSV = async ({
  walletPubkey,
  tokenType,
}: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<string>(
    `${BACKEND_BASE_URL}/spl-activity/borrower/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}

export const fetchLenderActivityCSV = async ({
  walletPubkey,
  tokenType,
}: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<string>(
    `${BACKEND_BASE_URL}/spl-activity/lender/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}
