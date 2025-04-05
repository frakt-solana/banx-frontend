import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { BorrowOfferSchemaRaw, OfferPreviewSchema, OfferSchema, OfferSchemaApi } from './schemas'

//? ========= Data types =========
export type OfferPreview = z.infer<typeof OfferPreviewSchema>

export type Offer = z.infer<typeof OfferSchema>
export type OfferApi = z.infer<typeof OfferSchemaApi>

export type BorrowOfferRaw = z.infer<typeof BorrowOfferSchemaRaw>

//? ========= API function types =========
export type FetchMarketOffers = (props: {
  marketPubkey?: string
  tokenType: LendingTokenType
  getAll?: boolean
  excludeWallet?: string
}) => Promise<BondOfferV3[] | undefined>

export type FetchUserOffersPreview = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
}) => Promise<OfferPreview[] | undefined>

export type FetchBorrowOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  customLtv: number | undefined //? base points
  excludeWallet?: string
}) => Promise<BorrowOfferRaw[] | undefined>
