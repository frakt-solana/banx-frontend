import { z } from 'zod'

import { TokenMetaSchema } from '@banx/api/core/shared'

export const LenderActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,
  tokenSupply: z.number(),

  apr: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  received: z.number(),
  status: z.string(),
  timestamp: z.number(),
})

export const BorrowerActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,
  tokenSupply: z.number(),

  borrowed: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  repaid: z.number(),
  status: z.string(),
  timestamp: z.number(),
})
