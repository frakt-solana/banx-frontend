import { useEffect, useMemo, useState } from 'react'

import { filterBySearchQuery } from '@banx/components/Search'

import { MarketTokenRewards, TokenMarketPreview } from '@banx/api'
import { MarketCategory } from '@banx/constants'
import { useTokenType } from '@banx/store/common'

export const useMarketsFilter = (
  markets: TokenMarketPreview[],
  allRewardsData: Record<string, MarketTokenRewards>,
) => {
  const { tokenType } = useTokenType()

  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(MarketCategory.All)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [isExtraRewardFilterActive, setIsExtraRewardFilterActive] = useState(false)
  const [isHotFilterActive, setIsHotFilterActive] = useState(false)

  const onChangeCategory = (category: MarketCategory) => {
    setSelectedCategory(category)
  }

  const onToggleExtraRewardFilter = () => {
    setIsExtraRewardFilterActive((prev) => !prev)
  }

  const onToggleHotFilter = () => {
    setIsHotFilterActive((prev) => !prev)
  }

  //? Reset extra rewards filter when tokenType changes
  useEffect(() => {
    setIsExtraRewardFilterActive(false)
  }, [tokenType])

  const filteredHotMarkets = useMemo(() => {
    if (!isHotFilterActive) return markets

    return markets.filter((market) => market.isHot)
  }, [markets, isHotFilterActive])

  const filteredExtraRewardsMarkets = useMemo(() => {
    if (!isExtraRewardFilterActive) return filteredHotMarkets

    return filteredHotMarkets.filter((market) => !!allRewardsData[market.marketPubkey])
  }, [filteredHotMarkets, isExtraRewardFilterActive, allRewardsData])

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === MarketCategory.All) return filteredExtraRewardsMarkets

    return filteredExtraRewardsMarkets.filter((market) =>
      market.marketCategory.includes(selectedCategory),
    )
  }, [filteredExtraRewardsMarkets, selectedCategory])

  const filtereMarketsBySearch = useMemo(() => {
    return filterBySearchQuery(filteredByCategory, searchQuery, [
      (market) => market.collateral.name,
      (market) => market.collateral.mint,
    ])
  }, [filteredByCategory, searchQuery])

  const isDisabledExtraRewardFilter = useMemo(
    () => !filteredByCategory.some((market) => allRewardsData[market.marketPubkey]),
    [filteredByCategory, allRewardsData],
  )

  const isDisabledHotFilter = useMemo(
    () => !filteredByCategory.some((market) => market.isHot),
    [filteredByCategory],
  )

  return {
    filteredMarkets: filtereMarketsBySearch,

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
  }
}
