import { BN, web3 } from 'fbonds-core'
import {
  BondFeatures,
  BondTradeTransactionV2State,
  BondTradeTransactionV2Type,
  BondTradeTransactionV3,
  BondingCurveType,
  FraktBondState,
  LendingTokenType,
  PairState,
  RedeemResult,
  RepayDestination,
  UserVaultState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { BondTradeTransaction } from '../nft'
import { RarityTier, TokenStandard } from './types'

export const SerializedBNSchema = z.string().transform((value) => {
  return new BN(value)
})

export const StringToNumberSchema = z.string().transform((value) => {
  return parseFloat(value)
})

export const StringIntSchema = z.string().transform((value) => {
  return parseInt(value)
})

export const SerializedIntBNSchema = z.number().transform((value) => {
  return new BN(value.toString())
})

export const SerializedPublicKeySchema = z.string().transform((value) => {
  return new web3.PublicKey(value)
})

export const StringPublicKeySchema = z.string()

export const RaritySchema = z.object({
  tier: z.nativeEnum(RarityTier), //? string
  rank: z.number(), //? number
})

export const NFTSchema = z.object({
  mint: StringPublicKeySchema,
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
    tensorSlug: z.string(),
    partnerPoints: z.number().optional(),
    playerPoints: z.number().optional(),
    tokenStandard: z.nativeEnum(TokenStandard).or(z.string().optional()),
    collectionId: z.string().optional(),
  }),
  //? Change to BN and PublicKey?
  compression: z
    .object({
      dataHash: z.string(),
      creatorHash: z.string(),
      leafId: z.number(),
      tree: z.string(),
      whitelistEntry: z.string(),
    })
    .optional(),
  collectionFloor: StringIntSchema,
  rarity: RaritySchema.optional().nullable(),
  interestFee: StringIntSchema,
  upfrontFee: StringIntSchema,
})

const BondingCurveSchema = z.object({
  delta: StringIntSchema,
  bondingType: z.nativeEnum(BondingCurveType),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: StringIntSchema,
  collateralsPerToken: StringIntSchema,
  maxReturnAmountFilter: StringIntSchema,
  bondFeatures: z.nativeEnum(BondFeatures),
})

export const OfferSchema = z.object({
  publicKey: StringPublicKeySchema,
  assetReceiver: StringPublicKeySchema,
  baseSpotPrice: StringIntSchema,
  bidCap: StringIntSchema,
  bidSettlement: StringIntSchema,
  bondingCurve: BondingCurveSchema,
  buyOrdersQuantity: StringIntSchema,
  concentrationIndex: StringIntSchema,
  currentSpotPrice: StringIntSchema,
  edgeSettlement: StringIntSchema,
  fundsSolOrTokenBalance: StringIntSchema,
  hadoMarket: StringPublicKeySchema,
  lastTransactedAt: StringIntSchema,
  mathCounter: StringIntSchema,
  pairState: z.nativeEnum(PairState),
  validation: ValidationPairSchema,

  loanApr: StringIntSchema.default('0'),
  liquidationLtvBp: StringIntSchema.optional(), //? Exist only for token markets
  offerLtvBp: StringIntSchema.optional(), //? Exist only for token markets
})

export const BondTradeTransactionSchema = z.object({
  publicKey: StringPublicKeySchema,
  amountOfBonds: StringIntSchema,
  bondOffer: StringPublicKeySchema,
  bondTradeTransactionState: z.nativeEnum(BondTradeTransactionV2State),
  bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  borrowerFullRepaidAmount: StringIntSchema,
  borrowerOriginalLent: StringIntSchema,
  currentRemainingLent: StringIntSchema,
  fbondTokenMint: StringPublicKeySchema,
  feeAmount: StringIntSchema,
  interestSnapshot: StringIntSchema,
  isDirectSell: z.boolean(),
  lenderFullRepaidAmount: StringIntSchema,
  lenderOriginalLent: StringIntSchema,
  lendingToken: z.nativeEnum(LendingTokenType),
  partialRepaySnapshot: StringIntSchema,
  redeemResult: z.nativeEnum(RedeemResult),
  redeemedAt: StringIntSchema,
  repayDestination: z.nativeEnum(RepayDestination),
  repaymentCallAmount: StringIntSchema, //? Stores value that borrower needs to pay (NOT value that lender receives)
  seller: StringPublicKeySchema,
  solAmount: StringIntSchema,
  soldAt: StringIntSchema,
  terminationFreeze: StringIntSchema,
  terminationStartedAt: StringIntSchema,
  user: StringPublicKeySchema,
  redeemResultNext: z.nativeEnum(RedeemResult),
  protocolInterestFee: z.number(),
  collateralAmountSnapshot: StringIntSchema,
})

export const FraktBondSchema = z.object({
  publicKey: StringPublicKeySchema,
  activatedAt: StringIntSchema,
  actualReturnedAmount: StringIntSchema,
  leverageBasePoints: StringIntSchema,
  banxStake: StringPublicKeySchema,
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: StringIntSchema,
  currentPerpetualBorrowed: StringIntSchema,
  fbondIssuer: StringPublicKeySchema,
  fbondTokenMint: StringPublicKeySchema,
  fbondTokenSupply: StringIntSchema,
  fraktBondState: z.nativeEnum(FraktBondState),
  fraktMarket: StringPublicKeySchema,
  lastTransactedAt: StringIntSchema,
  liquidatingAt: StringIntSchema,
  refinanceAuctionStartedAt: StringIntSchema,
  repaidOrLiquidatedAt: StringIntSchema,
  terminatedCounter: z.number(),
  hadoMarket: StringPublicKeySchema,
})

export const UserVaultSchema = z.object({
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

export const UserVaultPrimitiveSchema = z.object({
  publicKey: StringPublicKeySchema,
  userVaultState: z.nativeEnum(UserVaultState),
  user: StringPublicKeySchema,
  lendingTokenType: z.nativeEnum(LendingTokenType),
  offerLiquidityAmount: StringIntSchema,
  liquidityInLoansAmount: StringIntSchema,
  repaymentsAmount: StringIntSchema,
  interestRewardsAmount: StringIntSchema,
  rentRewards: StringIntSchema,
  fundsInCurrentEpoch: StringIntSchema,
  fundsInNextEpoch: StringIntSchema,
  lastCalculatedSlot: StringIntSchema,
  lastCalculatedTimestamp: StringIntSchema,
  rewardsToHarvest: StringIntSchema,
  rewardsHarvested: StringIntSchema,
  lastTransactedAt: StringIntSchema,
})

export const convertBondTradeTransactionToCore = (
  schema: BondTradeTransaction,
): BondTradeTransactionV3 => {
  return {
    ...schema,
    publicKey: new web3.PublicKey(schema.publicKey),
    amountOfBonds: new BN(schema.amountOfBonds),
    bondOffer: new web3.PublicKey(schema.bondOffer),
    borrowerFullRepaidAmount: new BN(schema.borrowerFullRepaidAmount),
    borrowerOriginalLent: new BN(schema.borrowerOriginalLent),
    currentRemainingLent: new BN(schema.currentRemainingLent),
    fbondTokenMint: new web3.PublicKey(schema.fbondTokenMint),
    feeAmount: new BN(schema.feeAmount),
    interestSnapshot: new BN(schema.interestSnapshot),
    lenderFullRepaidAmount: new BN(schema.lenderFullRepaidAmount),
    lenderOriginalLent: new BN(schema.lenderOriginalLent),
    partialRepaySnapshot: new BN(schema.partialRepaySnapshot),
    redeemedAt: new BN(schema.redeemedAt),
    repaymentCallAmount: new BN(schema.repaymentCallAmount),
    seller: new web3.PublicKey(schema.seller),
    solAmount: new BN(schema.solAmount),
    soldAt: new BN(schema.soldAt),
    terminationFreeze: new BN(schema.terminationFreeze),
    terminationStartedAt: new BN(schema.terminationStartedAt),
    user: new web3.PublicKey(schema.user),
    redeemResultNext: schema.redeemResultNext,
    protocolInterestFee: new BN(schema.protocolInterestFee),
    collateralAmountSnapshot: new BN(schema.collateralAmountSnapshot.toString()),
  }
}
