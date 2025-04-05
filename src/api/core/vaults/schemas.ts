import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zStringToInt } from '@banx/api/zodSchemas'

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
