import { useMemo, useState } from 'react'

import _ from 'lodash'

import { MarketTokenType } from '@banx/components/Dropdowns'
import { filterBySearchQuery } from '@banx/components/Search'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE } from '@banx/constants/messages'

import { useLoanListingsData } from './useLoanListingsData'
import { useLoanListingsSorting } from './useLoanListingsSorting'

export const useLoanListingsView = () => {
  const { loans, isLoading } = useLoanListingsData()

  const [searchQuery, setSearchQuery] = useState<string>('')

  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')

  const handleSelectedTokenChange = (value: MarketTokenType) => {
    setSelectedLendingToken(value)
  }

  const filteredLoansByLendingToken = useMemo(() => {
    if (selectedLendingToken === 'ALL') return loans
    return loans.filter((loan) => loan.bondTradeTransaction.lendingToken === selectedLendingToken)
  }, [loans, selectedLendingToken])

  const filteredBySearchQuery = useMemo(() => {
    return filterBySearchQuery(filteredLoansByLendingToken, searchQuery, [
      (loan) => loan.collateral.mint,
      (loan) => loan.collateral.ticker,
    ])
  }, [filteredLoansByLendingToken, searchQuery])

  const { sortedLoans, sortParams } = useLoanListingsSorting(filteredBySearchQuery)

  const isNoLoans = !isLoading && _.isEmpty(loans)
  const isFilteredListEmpty = !isLoading && _.isEmpty(filteredBySearchQuery)

  const filteredListEmptyMessage = (() => {
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return NO_LOANS_IN_MARKET_MESSAGE(loans.length)
    return ''
  })()

  return {
    loans: sortedLoans,
    loading: isLoading,

    isNoLoans,
    filteredListEmptyMessage,

    searchQuery,
    setSearchQuery,

    selectedLendingToken,
    handleSelectedTokenChange,

    sortViewParams: {
      sortParams,
    },
  }
}
