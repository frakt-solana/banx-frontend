import { useMemo, useState } from 'react'

import { isEmpty } from 'lodash'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE } from '@banx/constants/messages'

import { useWalletTokenLoans } from '../../hooks'
import { buildLoansPreviewGroupedByMint } from '../helpers'
import { useFilterLoansPreviews } from './useFilterLoansPreviews'
import { useSortLoansPreviews } from './useSortLoansPreviews'

export const useLoansContent = () => {
  const { loans, isLoading } = useWalletTokenLoans()

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
  } = useFilterLoansPreviews(loansPreviews)

  const { sortedLoansPreviews, sortParams } = useSortLoansPreviews(filteredLoansPreviews)

  const isNoLoans = isEmpty(loans) && !isLoading
  const isFilteredListEmpty = isEmpty(filteredLoansPreviews) && !isLoading

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
