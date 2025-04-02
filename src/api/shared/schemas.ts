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
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { BondTradeTransaction } from '../nft'
import { StringIntSchema } from '../zodSchemas'

export const SerializedPublicKeySchema = z.string().transform((value) => new web3.PublicKey(value))

export const StringPublicKeySchema = z.string()

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
  liquidationLtvBp: StringIntSchema, //? Exist only for token markets
  offerLtvBp: StringIntSchema, //? Exist only for token markets
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
