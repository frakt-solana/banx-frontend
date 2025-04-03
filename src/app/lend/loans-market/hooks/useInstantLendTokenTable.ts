import { isEmpty } from 'lodash'

import { MESSAGES } from '@banx/constants/messages'
import { useTokenType } from '@banx/store/common'

import { useAllLoanAuctionsAndListings } from './useAllLoanAuctionsAndListings'
import { useFilterLoans } from './useFilterLoans'
import { useSortedLoans } from './useSortedLoans'

export const useInstantLendTokenTable = () => {
  const { loans, isLoading } = useAllLoanAuctionsAndListings()

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
  } = useFilterLoans(loans)

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

  const isNoLoans = !isLoading && isEmpty(loans)
  const isFilteredListEmpty =
    !isLoading &&
    isEmpty(filteredLoans) &&
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
