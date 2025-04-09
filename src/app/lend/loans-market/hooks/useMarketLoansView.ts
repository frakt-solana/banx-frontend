import _ from 'lodash'

import { MESSAGES } from '@banx/constants/messages'
import { useTokenType } from '@banx/store/common'

import { useMarketLoansData } from './useMarketLoansData'
import { useMarketLoansFilter } from './useMarketLoansFilter'
import { useMarketLoansSorting } from './useMarketLoansSorting'

export const useMarketLoansView = () => {
  const { loans, isLoading } = useMarketLoansData()

  const { tokenType, setTokenType } = useTokenType()

  const {
    filteredLoans,
    searchQuery,
    setSearchQuery,
    auctionLoansAmount,
    freezeLoansAmount,
    isAuctionFilterEnabled,
    toggleAuctionFilter,
    isFreezeFilterEnabled,
    toggleFreezeFilter,
  } = useMarketLoansFilter(loans)

  const { sortedLoans, sortParams } = useMarketLoansSorting(filteredLoans)

  const isNoLoans = !isLoading && _.isEmpty(loans)
  const isFilteredListEmpty =
    !isLoading &&
    _.isEmpty(filteredLoans) &&
    (!isAuctionFilterEnabled || !isFreezeFilterEnabled || !!searchQuery)

  const filteredListEmptyMessage = (() => {
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return MESSAGES.EMPTY_FILTERED_LIST
    return ''
  })()

  return {
    loans: sortedLoans,
    loading: isLoading,

    isNoLoans,
    filteredListEmptyMessage,

    tokenType,
    setTokenType,

    searchQuery,
    setSearchQuery,

    auctionLoansAmount,
    freezeLoansAmount,
    isAuctionFilterEnabled,
    toggleAuctionFilter,
    isFreezeFilterEnabled,
    toggleFreezeFilter,
    sortViewParams: {
      sortParams,
    },
  }
}
