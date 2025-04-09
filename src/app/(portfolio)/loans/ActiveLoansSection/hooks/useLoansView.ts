import { useMemo, useState } from 'react'

import _ from 'lodash'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE } from '@banx/constants/messages'

import { buildLoansPreviewGroupedByMint } from '../helpers'
import { useLoansData } from './useLoansData'
import { useLoansPreviewFilter } from './useLoansPreviewFilter'
import { useLoansPrivewSorting } from './useLoansPreviewSorting'

export const useLoansView = () => {
  const { loans, isLoading } = useLoansData()

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
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
  } = useLoansPreviewFilter(loansPreviews)

  const { sortedLoansPreviews, sortParams } = useLoansPrivewSorting(filteredLoansPreviews)

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
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    expandedPreviewId,
    handleCardToggle,

    sortParams,
  }
}
