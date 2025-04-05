import { useMemo, useState } from 'react'

import { isEmpty } from 'lodash'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE } from '@banx/constants/messages'

import { buildLoansPreviewGroupedByMint } from '../helpers'
import { useFilterLenderTokenLoansPreviews } from './useFilterLenderTokenLoansPreviews'
import { useLenderTokenLoans } from './useLenderTokenLoans'
import { useSortLenderTokenLoansPreviews } from './useSortLenderTokenLoansPreviews'

export const useLenderTokenLoansContent = () => {
  const { loans, isLoading } = useLenderTokenLoans()

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
  } = useFilterLenderTokenLoansPreviews(loansPreviews)

  const { sortedLoansPreviews, sortParams } = useSortLenderTokenLoansPreviews(filteredLoansPreviews)

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
