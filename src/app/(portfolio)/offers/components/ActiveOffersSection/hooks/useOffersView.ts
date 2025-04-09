import { useMemo, useState } from 'react'

import _ from 'lodash'

import { MarketTokenType } from '@banx/components/Dropdowns'
import { filterBySearchQuery } from '@banx/components/Search'

import { MarketCategory } from '@banx/constants'
import { MESSAGES, NO_OFFERS_IN_MARKET_MESSAGE } from '@banx/constants/messages'
import { getLendingTokenFromBondingCurve } from '@banx/utils/core'

import { useOffersPreviewData } from './useOffersPreviewData'
import { useOffersPreviewSorting } from './useOffersPreviewSorting'

export const useOffersView = () => {
  const { offersPreview, updateOrAddOffer, isLoading } = useOffersPreviewData()

  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(MarketCategory.All)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [visibleOfferPubkey, setOfferPubkey] = useState('')

  const handleSelectedTokenChange = (value: MarketTokenType) => {
    setSelectedLendingToken(value)
  }

  const onChangeCategory = (category: MarketCategory) => {
    setSelectedCategory(category)
  }

  const onCardClick = (offerPubkey: string) => {
    const isSameOfferPubkey = visibleOfferPubkey === offerPubkey
    const nextValue = !isSameOfferPubkey ? offerPubkey : ''
    return setOfferPubkey(nextValue)
  }

  const filteredByLendingToken = useMemo(() => {
    if (selectedLendingToken === 'ALL') return offersPreview

    return offersPreview.filter(({ bondOffer }) => {
      const lendingToken = getLendingTokenFromBondingCurve(bondOffer.bondingCurve.bondingType)
      return lendingToken === selectedLendingToken
    })
  }, [offersPreview, selectedLendingToken])

  const filteredBySearchQuery = useMemo(() => {
    return filterBySearchQuery(filteredByLendingToken, searchQuery, [
      (preview) => preview.tokenMarketPreview.collateral.name,
      (preview) => preview.tokenMarketPreview.collateral.mint,
    ])
  }, [filteredByLendingToken, searchQuery])

  const filteredOffers = useMemo(() => {
    if (selectedCategory === MarketCategory.All) return filteredBySearchQuery

    return filteredBySearchQuery.filter((preview) =>
      preview.tokenMarketPreview.marketCategory.includes(selectedCategory),
    )
  }, [filteredBySearchQuery, selectedCategory])

  const { sortParams, sortedOffers } = useOffersPreviewSorting(filteredOffers)

  const isNoOffers = _.isEmpty(offersPreview) && !isLoading
  const isFilteredListEmpty = _.isEmpty(filteredOffers) && !isLoading

  const filteredListEmptyMessage = (() => {
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty && selectedCategory !== 'All') return MESSAGES.EMPTY_FILTERED_LIST
    if (isFilteredListEmpty) return NO_OFFERS_IN_MARKET_MESSAGE(offersPreview.length)
    return ''
  })()

  return {
    offersPreview: sortedOffers,
    updateOrAddOffer,
    isLoading,

    isNoOffers,
    isFilteredListEmpty,
    filteredListEmptyMessage,

    sortParams,
    visibleOfferPubkey,
    onCardClick,

    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    selectedCategory,
    onChangeCategory,
  }
}
