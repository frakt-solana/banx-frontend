import { useMemo, useState } from 'react'

import _ from 'lodash'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE } from '@banx/constants/messages'

import { buildLoansPreviewGroupedByMint } from '../helpers'
import { useLenderLoansData } from './useLenderLoansData'
import { useLenderLoansPreviewFilter } from './useLenderLoansPreviewFilter'
import { useLenderLoansPreviewSorting } from './useLenderLoansPreviewSorting'

export const useLenderLoansView = () => {
  const { loans, isLoading } = useLenderLoansData()

  const loansPreviews = useMemo(() => buildLoansPreviewGroupedByMint(loans), [loans])

  const [expandedPreviewId, setExpandedPreviewId] = useState('')

  const handleCardToggle = (id: string) => {
    setExpandedPreviewId((prevId) => (prevId === id ? '' : id))
  }

  const {
    filteredLoansPreviews,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    terminatingLoansAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    liquidatedLoansAmount,
    isLiquidatedFilterEnabled,
    toggleLiquidatedFilter,
    underwaterLoansAmount,
    isUnderwaterFilterEnabled,
    toggleUnderwaterFilter,
  } = useLenderLoansPreviewFilter(loansPreviews)

  const { sortedLoansPreviews, sortParams } = useLenderLoansPreviewSorting(filteredLoansPreviews)

  const isNoLoans = _.isEmpty(loans) && !isLoading
  const isFilteredListEmpty = _.isEmpty(filteredLoansPreviews) && !isLoading

  const filteredListEmptyMessage = (() => {
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return NO_LOANS_IN_MARKET_MESSAGE(loans.length)
    return ''
  })()

  return {
    loansPreviews: sortedLoansPreviews,
    isLoading,

    isNoLoans,
    isFilteredListEmpty,
    filteredListEmptyMessage,

    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,

    terminatingLoansAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,

    liquidatedLoansAmount,
    isLiquidatedFilterEnabled,
    toggleLiquidatedFilter,

    underwaterLoansAmount,
    isUnderwaterFilterEnabled,
    toggleUnderwaterFilter,

    expandedPreviewId,
    handleCardToggle,

    sortParams,
  }
}
