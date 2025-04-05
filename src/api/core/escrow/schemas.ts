import { LendingTokenType, UserVaultState } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zStringToBN, zStringToPubkey } from '@banx/api/zodSchemas'

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
