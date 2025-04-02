import { z } from 'zod'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  NFTSchema,
  OfferSchema,
  StringIntSchema,
  StringPublicKeySchema,
  UserVaultPrimitiveSchema,
} from '@banx/api/shared'

const MarketMetaSchema = z.object({
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const MarketPreviewSchema = z
  .object({
    marketPubkey: StringPublicKeySchema,
    collectionFloor: StringIntSchema,
    offerTvl: StringIntSchema,
    bestOffer: StringIntSchema,
    activeBondsAmount: z.number(),
    activeOfferAmount: z.number(),
    loansTvl: StringIntSchema,
    isHot: z.boolean(),
    tensorSlug: z.string().optional(), //TODO Remove when BE fix this
    interestFee: StringIntSchema,
    upfrontFee: StringIntSchema,
  })
  .merge(MarketMetaSchema)

export const LoanSchema = z.object({
  publicKey: StringPublicKeySchema,
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchema,
  totalRepaidAmount: z.number().optional(), //? exist only in fetchLenderLoansAndOffers request
  accruedInterest: z.number().optional(),
})

export const WalletLoansAndOffersShema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const BorrowNftSchema = z.object({
  mint: StringPublicKeySchema,
  loan: z.object({
    marketPubkey: StringPublicKeySchema,
    fraktMarket: StringPublicKeySchema,
    banxStake: StringPublicKeySchema.optional(), //? exists when nft is banx and it's staked
  }),
  nft: NFTSchema,
})

export const BorrowNftsAndOffersSchema = z.object({
  nfts: BorrowNftSchema.array(),
  offers: z.record(OfferSchema.array()),
  userVaults: UserVaultPrimitiveSchema.array(),
})

export const CollectionMetaSchema = z.object({
  collectionFloor: StringIntSchema,
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const LenderLoansSchema = z.object({
  offer: OfferSchema,
  loans: LoanSchema.array(),
})

export const LoansRequestsSchema = z.object({
  auctions: LoanSchema.array(),
  listings: LoanSchema.array(),
})

export const UserOfferSchema = z.object({
  offer: OfferSchema,
  collectionMeta: CollectionMetaSchema,
})
