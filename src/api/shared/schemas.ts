import { BN, web3 } from 'fbonds-core'
import {
  BondFeatures,
  BondOfferV3,
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
import { convertValuesInAccount } from 'solana-transactions-parser'
import { z } from 'zod'

import { bnToNumberSafe } from '@banx/utils'

import { zPubkeyString, zStringToInt, zStringToPubkey } from '../zodSchemas'
import { BondTradeTransaction, Offer } from './types'

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

  loanApr: zStringToInt.default('0'),
  liquidationLtvBp: zStringToInt,
  offerLtvBp: zStringToInt,
})

export const BondTradeTransactionSchema = z.object({
  publicKey: zPubkeyString,
  amountOfBonds: zStringToInt,
  bondOffer: zPubkeyString,
  bondTradeTransactionState: z.nativeEnum(BondTradeTransactionV2State),
  bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  borrowerFullRepaidAmount: zStringToInt,
  borrowerOriginalLent: zStringToInt,
  currentRemainingLent: zStringToInt,
  fbondTokenMint: zPubkeyString,
  feeAmount: zStringToInt,
  interestSnapshot: zStringToInt,
  isDirectSell: z.boolean(),
  lenderFullRepaidAmount: zStringToInt,
  lenderOriginalLent: zStringToInt,
  lendingToken: z.nativeEnum(LendingTokenType),
  partialRepaySnapshot: zStringToInt,
  redeemResult: z.nativeEnum(RedeemResult),
  redeemedAt: zStringToInt,
  repayDestination: z.nativeEnum(RepayDestination),
  repaymentCallAmount: zStringToInt, //? Stores value that borrower needs to pay (NOT value that lender receives)
  seller: zPubkeyString,
  solAmount: zStringToInt,
  soldAt: zStringToInt,
  terminationFreeze: zStringToInt,
  terminationStartedAt: zStringToInt,
  user: zPubkeyString,
  redeemResultNext: z.nativeEnum(RedeemResult),
  protocolInterestFee: z.number(),
  collateralAmountSnapshot: zStringToInt,
})

export const FraktBondSchema = z.object({
  publicKey: zPubkeyString,
  activatedAt: zStringToInt,
  actualReturnedAmount: zStringToInt,
  leverageBasePoints: zStringToInt,
  banxStake: zPubkeyString,
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: zStringToInt,
  currentPerpetualBorrowed: zStringToInt,
  fbondIssuer: zPubkeyString,
  fbondTokenMint: zPubkeyString,
  fbondTokenSupply: zStringToInt,
  fraktBondState: z.nativeEnum(FraktBondState),
  fraktMarket: zPubkeyString,
  lastTransactedAt: zStringToInt,
  liquidatingAt: zStringToInt,
  refinanceAuctionStartedAt: zStringToInt,
  repaidOrLiquidatedAt: zStringToInt,
  terminatedCounter: z.number(),
  hadoMarket: zPubkeyString,
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

export const convertBondOfferV3ToCore = (bondOffer: BondOfferV3): Offer => {
  return convertValuesInAccount<Offer>(bondOffer, {
    bnParser: (v) => {
      return bnToNumberSafe(v)
    },
    pubkeyParser: (v) => v.toBase58(),
  })
}

export const convertCoreOfferToBondOfferV3 = (offer: unknown): BondOfferV3 => {
  const parsed = BondOfferV3Schema.parse(offer)
  return parsed as BondOfferV3
}
const SerializedToNumberBNSchema = z.number().transform((value) => {
  return new BN(value)
})

const BondOfferV3Schema = z.object({
  publicKey: zStringToPubkey,
  assetReceiver: zStringToPubkey,
  baseSpotPrice: SerializedToNumberBNSchema,
  bidCap: SerializedToNumberBNSchema,
  bidSettlement: SerializedToNumberBNSchema,
  bondingCurve: z.object({
    delta: SerializedToNumberBNSchema,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: SerializedToNumberBNSchema,
  concentrationIndex: SerializedToNumberBNSchema,
  currentSpotPrice: SerializedToNumberBNSchema,
  edgeSettlement: SerializedToNumberBNSchema,
  fundsSolOrTokenBalance: SerializedToNumberBNSchema,
  hadoMarket: zStringToPubkey,
  lastTransactedAt: SerializedToNumberBNSchema,
  mathCounter: SerializedToNumberBNSchema,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: SerializedToNumberBNSchema,
    collateralsPerToken: SerializedToNumberBNSchema,
    maxReturnAmountFilter: SerializedToNumberBNSchema,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  loanApr: SerializedToNumberBNSchema.default(0),
  liquidationLtvBp: SerializedToNumberBNSchema,
  offerLtvBp: SerializedToNumberBNSchema,
})
