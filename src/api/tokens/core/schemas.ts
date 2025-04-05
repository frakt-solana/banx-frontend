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
  zNumberToBN,
  zPubkeyString,
  zStringToBN,
  zStringToFloat,
  zStringToInt,
  zStringToPubkey,
} from '@banx/api/zodSchemas'
import { MarketCategory } from '@banx/constants'

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
  interestFee: zStringToInt,
  upfrontFee: zStringToInt,
  oraclePriceFeedType: z.nativeEnum(OraclePriceFeedType),
  oraclePriceFeed: z.string().optional(),
})

export const TokenLoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  collateral: TokenMetaSchema,
  collateralPrice: zStringToFloat,
  totalRepaidAmount: z.number().optional(),
  pnl: z.number().nullable().optional(),
  offerLtvBp: zStringToInt,
  liquidationLtvBp: zStringToInt,
})

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: zStringToInt,

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

  loanApr: zStringToBN.default('0'),
  liquidationLtvBp: zStringToBN,
  offerLtvBp: zStringToBN,
})

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: BondOfferV3Schema,
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

export const TokenLoanAuctionsAndListingsSchema = z.object({
  auctions: TokenLoanSchema.array(),
  listings: TokenLoanSchema.array(),
})

export const CollateralTokenSchema = z.object({
  marketPubkey: z.string(),
  collateral: TokenMetaSchema,
  collateralPrice: zStringToInt,
  amountInWallet: zNumberToBN,
})

export const DBOfferSchema = z.object({
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

  reserves: zStringToInt,
  requestedWithdrawAmount: zStringToInt,
  userTotalDepositedAmount: zStringToInt,
  pendingClaimAmount: zStringToInt,

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
  publicKey: zStringToPubkey,
  userVaultState: z.nativeEnum(UserVaultState),
  user: zStringToPubkey,
  lendingTokenType: z.nativeEnum(LendingTokenType),
  offerLiquidityAmount: zStringToBN,
  liquidityInLoansAmount: zStringToBN,
  repaymentsAmount: zStringToBN,
  interestRewardsAmount: zStringToBN,
  rentRewards: zStringToBN,
  fundsInCurrentEpoch: zStringToBN,
  fundsInNextEpoch: zStringToBN,
  lastCalculatedSlot: zStringToBN,
  lastCalculatedTimestamp: zStringToBN,
  rewardsToHarvest: zStringToBN,
  rewardsHarvested: zStringToBN,
  lastTransactedAt: zStringToBN,
})
