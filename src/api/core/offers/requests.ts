import axios from 'axios'
import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'

import { convertToMarketType, parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { BorrowOfferSchemaRaw, OfferDBSchema, TokenOfferPreviewSchema } from './schemas'
import { BorrowOfferRaw, OfferDB, TokenOfferPreview } from './types'

type FetchTokenMarketOffers = (props: {
  marketPubkey?: string
  tokenType: LendingTokenType
  getAll?: boolean
  excludeWallet?: string
}) => Promise<BondOfferV3[] | undefined>

export const fetchTokenMarketOffers: FetchTokenMarketOffers = async ({
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

  const { data } = await axios.get<{ data: OfferDB[] }>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<BondOfferV3[]>(data?.data, OfferDBSchema.array())
}

type FetchTokenOffersPreview = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
}) => Promise<TokenOfferPreview[] | undefined>
export const fetchTokenOffersPreview: FetchTokenOffersPreview = async ({
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

  const { data } = await axios.get<{ data: TokenOfferPreview[] }>(
    `${BACKEND_BASE_URL}/spl-offers/my-offers-v2/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenOfferPreview[]>(data?.data, TokenOfferPreviewSchema.array())
}

type FetchBorrowOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  customLtv: number | undefined //? base points
  excludeWallet?: string
}) => Promise<BorrowOfferRaw[] | undefined>
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
