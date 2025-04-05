import {
  BondTradeTransactionV2State,
  BondTradeTransactionV2Type,
  FraktBondState,
  LendingTokenType,
  RedeemResult,
  RepayDestination,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zPubkeyString, zStringToFloat, zStringToInt } from '@banx/api/zodSchemas'

import { TokenMetaSchema } from '../shared'

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

export const TokenLoanAuctionsAndListingsSchema = z.object({
  auctions: TokenLoanSchema.array(),
  listings: TokenLoanSchema.array(),
})
