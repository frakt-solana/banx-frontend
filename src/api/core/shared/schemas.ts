import { OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zNumberToBN, zStringToInt } from '@banx/api/zodSchemas'

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

export const CollateralTokenSchema = z.object({
  marketPubkey: z.string(),
  collateral: TokenMetaSchema,
  collateralPrice: zStringToInt,
  amountInWallet: zNumberToBN,
})
