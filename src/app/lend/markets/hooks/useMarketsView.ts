import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { MESSAGES, PATHS } from '@banx/constants'
import { useMarketTokenRewards, useTokenMarketsPreview } from '@banx/hooks'
import { buildUrlWithModeAndToken, useTokenType } from '@banx/store'

import { useMarketsFilter } from './useMarketsFilter'
import { useMarketsSorting } from './useMarketsSorting'

export const useMarketsView = () => {
  const { tokenType, setTokenType } = useTokenType()
  const router = useRouter()

  const { marketsPreview, isLoading } = useTokenMarketsPreview()

  const { allRewardsData } = useMarketTokenRewards('')

  const onCardClick = (marketPubkey: string) => {
    const pathname = `${PATHS.LEND_MARKERS}/${marketPubkey}`
    return router.push(buildUrlWithModeAndToken(pathname, tokenType))
  }

  const {
    filteredMarkets,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    onChangeCategory,
    isHotFilterActive,
    onToggleHotFilter,
    isDisabledHotFilter,
    isExtraRewardFilterActive,
    onToggleExtraRewardFilter,
    isDisabledExtraRewardFilter,
  } = useMarketsFilter(marketsPreview, allRewardsData)

  const { sortedMarkets, sortParams } = useMarketsSorting(filteredMarkets)

  const isNoMarkets = !isLoading && _.isEmpty(marketsPreview)
  const isFilteredListEmpty = !isLoading && _.isEmpty(filteredMarkets)

  const emptyMessage = (() => {
    if (isNoMarkets) return MESSAGES.NO_MARKETS_AVAILABLE
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return MESSAGES.EMPTY_FILTERED_LIST
    return
  })()

  return {
    marketsPreview: sortedMarkets,
    isLoading,
    onCardClick,
    emptyMessage,

    searchQuery,
    setSearchQuery,

    tokenType,
    setTokenType,

    selectedCategory,
    onChangeCategory,

    isHotFilterActive,
    onToggleHotFilter,
    isDisabledHotFilter,

    isExtraRewardFilterActive,
    onToggleExtraRewardFilter,
    isDisabledExtraRewardFilter,

    sortParams,
  }
}
