import axios from 'axios'

import { convertToMarketType } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { TokenMarketPreviewSchema } from './schemas'
import {
  FetchTokenMarketsPreview,
  MarketTokenRewardsResponse,
  TokenMarketPreviewResponse,
} from './types'

export const fetchTokenMarketsPreview: FetchTokenMarketsPreview = async ({ tokenType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<TokenMarketPreviewResponse>(
    `${BACKEND_BASE_URL}/bonds/spl/preview-v2?${queryParams.toString()}`,
  )

  return await TokenMarketPreviewSchema.array().parseAsync(data.data)
}

export const fetchExtraTokenReward = async (): Promise<MarketTokenRewardsResponse> => {
  const { data } = await axios.get<MarketTokenRewardsResponse>('/rewards.json')
  return data
}
