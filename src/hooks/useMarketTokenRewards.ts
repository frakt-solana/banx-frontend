import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'

import { fetchExtraTokenReward } from '@banx/api'
import { useTokenType } from '@banx/store/common'

export const useMarketTokenRewards = (marketPubkey: string) => {
  const { tokenType } = useTokenType()

  const { data = {}, isLoading } = useQuery({
    queryKey: ['marketTokenRewards', marketPubkey, tokenType],
    queryFn: () => fetchExtraTokenReward(),
    staleTime: 1000 * 60 * 5,
  })

  const isMatchingTokenType = data[marketPubkey]?.lendingTokenType === tokenType
  const marketRewards = isMatchingTokenType ? data[marketPubkey] : undefined

  const allRewardsDataByMarket = useMemo(() => {
    return _.pickBy(data, (value) => value.lendingTokenType === tokenType)
  }, [data, tokenType])

  return { allRewardsData: allRewardsDataByMarket, marketRewards, isLoading }
}
