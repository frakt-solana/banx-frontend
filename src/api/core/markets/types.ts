import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { RequestWithPagination, ResponseWithPagination } from '@banx/api/shared'

import { TokenMarketPreviewSchema } from './schemas'

export type TokenMarketPreview = z.infer<typeof TokenMarketPreviewSchema>
export type TokenMarketPreviewResponse = ResponseWithPagination<TokenMarketPreview>

export type FetchTokenMarketsPreview = (
  props: RequestWithPagination<{ tokenType: LendingTokenType }>,
) => Promise<TokenMarketPreview[]>

interface RewardProgram {
  name: string
  rewardRate: string
  details: string
}

export interface MarketTokenRewards {
  lendingTokenType: LendingTokenType
  description: string
  rewardPrograms: Array<RewardProgram>
}

export type MarketTokenRewardsResponse = Record<string, MarketTokenRewards>
