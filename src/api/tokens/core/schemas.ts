import {
  BondFeatures,
  BondingCurveType,
  LendingTokenType,
  OraclePriceFeedType,
  PairState,
  UserVaultState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { BondTradeTransactionSchema, FraktBondSchema } from '@banx/api/shared'
import {
  SerializedBNSchema,
  SerializedIntBNSchema,
  SerializedPublicKeySchema,
  StringIntSchema,
  StringPublicKeySchema,
  StringToNumberSchema,
} from '@banx/api/zodSchemas'

import { MarketCategory } from './types'

export const TokenMetaSchema = z.object({
  mint: z.string(),
  name: z.string(),
  logoUrl: z.string(),
  ticker: z.string(),
  decimals: z.number(),
  priceUsd: z.number(),
  totalSupply: z.string(),
  fullyDilutedValuation: z.string(),
  fullyDilutedValuationInMillions: z.string(),
  interestFee: StringIntSchema,
  upfrontFee: StringIntSchema,
  oraclePriceFeedType: z.nativeEnum(OraclePriceFeedType),
  oraclePriceFeed: z.string().optional(),
})

export const TokenLoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  collateral: TokenMetaSchema,
  collateralPrice: StringToNumberSchema,
  totalRepaidAmount: z.number().optional(),
  pnl: z.number().nullable().optional(),
  offerLtvBp: StringIntSchema,
  liquidationLtvBp: StringIntSchema,
})

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: StringIntSchema,

  collectionName: z.string(),

  offersTvl: z.number(),
  loansTvl: z.number(),

  activeOffersAmount: z.number(),
  activeLoansAmount: z.number(),

  bestOffer: z.number(),
  marketApr: z.number(),

  marketCategory: z.array(z.string().or(z.nativeEnum(MarketCategory))),
  oraclePriceFeedType: z.nativeEnum(OraclePriceFeedType),
  isHot: z.boolean(),
})

export const BondOfferV3Schema = z.object({
  publicKey: SerializedPublicKeySchema,
  assetReceiver: SerializedPublicKeySchema,
  baseSpotPrice: SerializedBNSchema,
  bidCap: SerializedBNSchema,
  bidSettlement: SerializedBNSchema,
  bondingCurve: z.object({
    delta: SerializedBNSchema,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: SerializedBNSchema,
  concentrationIndex: SerializedBNSchema,
  currentSpotPrice: SerializedBNSchema,
  edgeSettlement: SerializedBNSchema,
  fundsSolOrTokenBalance: SerializedBNSchema,
  hadoMarket: SerializedPublicKeySchema,
  lastTransactedAt: SerializedBNSchema,
  mathCounter: SerializedBNSchema,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: SerializedBNSchema,
    collateralsPerToken: SerializedBNSchema,
    maxReturnAmountFilter: SerializedBNSchema,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  loanApr: SerializedBNSchema.default('0'),
  liquidationLtvBp: SerializedBNSchema,
  offerLtvBp: SerializedBNSchema,
})

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: BondOfferV3Schema,
  tokenMarketPreview: z.object({
    marketPubkey: z.string(),
    collateral: TokenMetaSchema,
    collateralPrice: StringIntSchema,
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

export const TokenLoanAuctionsAndListingsSchema = z.object({
  auctions: TokenLoanSchema.array(),
  listings: TokenLoanSchema.array(),
})

export const CollateralTokenSchema = z.object({
  marketPubkey: z.string(),
  collateral: TokenMetaSchema,
  collateralPrice: StringIntSchema,
  amountInWallet: SerializedIntBNSchema,
})

export const DBOfferSchema = z.object({
  publicKey: StringPublicKeySchema,
  assetReceiver: StringPublicKeySchema,
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
  hadoMarket: StringPublicKeySchema,
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

export const BorrowOfferSchemaRaw = z.object({
  id: z.string(),
  publicKey: z.string(),
  maxTokenToGet: z.string(), //? BN serialized to decimal string
  collateralsPerToken: z.string(), //? BN serialized to decimal string
  maxCollateralToReceive: z.string(), //? BN serialized to decimal string
  apr: z.string(), //?  BN serialized to decimal string (apr in base points)
  ltv: z.string(), //? BN serialized to decimal string (ltv in base points)
  assetReceiver: z.string(),
  offerLtvBp: StringIntSchema,
  liquidationLtvBp: StringIntSchema,
})

export const VaultPreviewSchema = z.object({
  vaultPubkey: z.string(),
  vaultName: z.string(),
  lenderWalletPubkey: z.string(),

  totalDepositedAmount: z.number(),
  maxCapacity: z.number(),
  loansTvl: z.number(),
  currentApy: z.number(),
  targetApy: z.number(),
  performance: z.number(),

  reserves: StringIntSchema,
  requestedWithdrawAmount: StringIntSchema,
  userTotalDepositedAmount: StringIntSchema,
  pendingClaimAmount: StringIntSchema,

  lendingToken: z.nativeEnum(LendingTokenType),

  assetsAllocation: z.array(
    z.object({
      allocation: z.number(),
      mint: z.string(),
      ticker: z.string(),
      logoUrl: z.string(),
      loansTvl: z.number(),
      totalDepositedAmount: z.number(),
      maxCapacity: z.number(),
      liquidationLtv: z.number(),
      avgLtv: z.number(),
      apr: z.number(),
    }),
  ),

  assetsDetails: z.array(
    z.object({
      mint: z.string(),
      ticker: z.string(),
      logoUrl: z.string(),
    }),
  ),

  curatorDetails: z.object({
    name: z.string(),
    description: z.string(),
    xUrl: z.string(),
  }),
})

export const MultiplyMarketDataSchema = z.object({
  maxMultiplier: z.number(),
  maxNetApr: z.number(),
  collateralApr: z.number(),
})

export const UserEscrowSchema = z.object({
  publicKey: SerializedPublicKeySchema,
  userVaultState: z.nativeEnum(UserVaultState),
  user: SerializedPublicKeySchema,
  lendingTokenType: z.nativeEnum(LendingTokenType),
  offerLiquidityAmount: SerializedBNSchema,
  liquidityInLoansAmount: SerializedBNSchema,
  repaymentsAmount: SerializedBNSchema,
  interestRewardsAmount: SerializedBNSchema,
  rentRewards: SerializedBNSchema,
  fundsInCurrentEpoch: SerializedBNSchema,
  fundsInNextEpoch: SerializedBNSchema,
  lastCalculatedSlot: SerializedBNSchema,
  lastCalculatedTimestamp: SerializedBNSchema,
  rewardsToHarvest: SerializedBNSchema,
  rewardsHarvested: SerializedBNSchema,
  lastTransactedAt: SerializedBNSchema,
})
