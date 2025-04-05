import { BondFeatures, BondingCurveType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zPubkeyString, zStringToBN, zStringToInt, zStringToPubkey } from '@banx/api/zodSchemas'
import { MarketCategory } from '@banx/constants'

import { TokenMetaSchema } from '../shared'

export const StrOfferToBondOfferV3Schema = z.object({
  publicKey: zStringToPubkey,
  assetReceiver: zStringToPubkey,
  baseSpotPrice: zStringToBN,
  bidCap: zStringToBN,
  bidSettlement: zStringToBN,
  bondingCurve: z.object({
    delta: zStringToBN,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: zStringToBN,
  concentrationIndex: zStringToBN,
  currentSpotPrice: zStringToBN,
  edgeSettlement: zStringToBN,
  fundsSolOrTokenBalance: zStringToBN,
  hadoMarket: zStringToPubkey,
  lastTransactedAt: zStringToBN,
  mathCounter: zStringToBN,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: zStringToBN,
    collateralsPerToken: zStringToBN,
    maxReturnAmountFilter: zStringToBN,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  loanApr: zStringToBN,
  liquidationLtvBp: zStringToBN,
  offerLtvBp: zStringToBN,
})

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: StrOfferToBondOfferV3Schema,
  tokenMarketPreview: z.object({
    marketPubkey: z.string(),
    collateral: TokenMetaSchema,
    collateralPrice: zStringToInt,
    marketCategory: z.array(z.string().or(z.nativeEnum(MarketCategory))),
  }),
  tokenOfferPreview: z.object({
    publicKey: z.string(),
    liquidatedLoansAmount: z.number(),
    terminatingLoansAmount: z.number(),
    repaymentCallsAmount: z.number(),
    inLoans: z.number(),
    offerSize: z.number(),
    accruedInterest: z.number(),
  }),
})

export const OfferSchema = z.object({
  publicKey: zPubkeyString,
  assetReceiver: zPubkeyString,
  baseSpotPrice: zStringToInt,
  bidCap: zStringToInt,
  bidSettlement: zStringToInt,
  bondingCurve: z.object({
    delta: zStringToInt,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: zStringToInt,
  concentrationIndex: zStringToInt,
  currentSpotPrice: zStringToInt,
  edgeSettlement: zStringToInt,
  fundsSolOrTokenBalance: zStringToInt,
  hadoMarket: zPubkeyString,
  lastTransactedAt: zStringToInt,
  mathCounter: zStringToInt,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: zStringToInt,
    collateralsPerToken: zStringToInt,
    maxReturnAmountFilter: zStringToInt,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  loanApr: zStringToInt,
  liquidationLtvBp: zStringToInt,
  offerLtvBp: zStringToInt,
})

export const BorrowOfferSchemaRaw = z.object({
  id: z.string(),
  publicKey: z.string(),
  maxTokenToGet: z.string(), //? BN serialized to decimal string
  collateralsPerToken: z.string(), //? BN serialized to decimal string
  maxCollateralToReceive: z.string(), //? BN serialized to decimal string
  apr: z.string(), //?  BN serialized to decimal string (apr in base points)
  ltv: z.string(), //? BN serialized to decimal string (ltv in base points)
  assetReceiver: z.string(),
  offerLtvBp: zStringToInt,
  liquidationLtvBp: zStringToInt,
})

export const OfferSchemaStr = z.object({
  publicKey: zPubkeyString,
  assetReceiver: zPubkeyString,
  baseSpotPrice: z.string(),
  bidCap: z.string(),
  bidSettlement: z.string(),
  bondingCurve: z.object({
    delta: z.string(),
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: z.string(),
  concentrationIndex: z.string(),
  currentSpotPrice: z.string(),
  edgeSettlement: z.string(),
  fundsSolOrTokenBalance: z.string(),
  hadoMarket: zPubkeyString,
  lastTransactedAt: z.string(),
  mathCounter: z.string(),
  pairState: z.nativeEnum(PairState),

  validation: z.object({
    loanToValueFilter: z.string(),
    collateralsPerToken: z.string(),
    maxReturnAmountFilter: z.string(),
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  loanApr: z.string(),
  liquidationLtvBp: z.string(),
  offerLtvBp: z.string(),
})
