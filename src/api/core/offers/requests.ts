import axios from 'axios'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { convertToMarketType, parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { BondOfferFromApiSchema, BorrowOfferSchemaRaw, OfferPreviewSchema } from './schemas'
import {
  BorrowOfferRaw,
  FetchBorrowOffers,
  FetchMarketOffers,
  FetchUserOffersPreview,
  OfferApi,
  OfferPreview,
} from './types'

export const fetchMarketOffers: FetchMarketOffers = async ({
  marketPubkey,
  tokenType,
  getAll = true,
  excludeWallet,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    excludeWallet: String(excludeWallet),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<{ data: OfferApi[] }>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<BondOfferV3[]>(data?.data, BondOfferFromApiSchema.array())
}

export const fetchUserOffersPreview: FetchUserOffersPreview = async ({
  walletPubkey,
  tokenType,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: OfferPreview[] }>(
    `${BACKEND_BASE_URL}/spl-offers/my-offers-v2/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<OfferPreview[]>(data?.data, OfferPreviewSchema.array())
}

export const fetchBorrowOffers: FetchBorrowOffers = async (props) => {
  const { market, bondingCurveType, customLtv, excludeWallet } = props

  const queryParams = new URLSearchParams({
    market: String(market),
    bondingCurveType: String(bondingCurveType),
    excludeWallet: String(excludeWallet),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (customLtv) {
    queryParams.append('customLtv', String(customLtv))
  }

  const { data } = await axios.get<{ data: BorrowOfferRaw[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<BorrowOfferRaw[]>(data?.data, BorrowOfferSchemaRaw.array())
}
