import { useMemo, useState } from 'react'

import _ from 'lodash'

import { filterBySearchQuery } from '@banx/components/Search'

import { Loan } from '@banx/api'
import { isLoanFrozen, isLoanListed, isLoanSelling, isLoanTerminating } from '@banx/utils/core'

type LoanPredicate = (loan: Loan) => boolean

export const useMarketLoansFilter = (loans: Loan[]) => {
  const [isAuctionFilterEnabled, setAuctionFilterState] = useState(true)
  const [isFreezeFilterEnabled, setFreezeFilterState] = useState(true)

  const [searchQuery, setSearchQuery] = useState<string>('')

  const toggleAuctionFilter = () => {
    setAuctionFilterState(!isAuctionFilterEnabled)
  }

  const toggleFreezeFilter = () => {
    setFreezeFilterState(!isFreezeFilterEnabled)
  }

  const filteredBySearchQuery = useMemo(() => {
    return filterBySearchQuery(loans, searchQuery, [
      (loan) => loan.collateral.ticker,
      (loan) => loan.collateral.mint,
    ])
  }, [loans, searchQuery])

  const filteredLoans = useMemo(() => {
    const applyFilter = (sourceLoans: Loan[]) => {
      const baseLoans = getBaseLoans(sourceLoans)
      const auctionLoans = _.filter(sourceLoans, isLoanTerminating)
      const frozenLoans = _.filter(sourceLoans, isLoanFrozen)

      const auctionFilterResult = isAuctionFilterEnabled ? auctionLoans : []
      const freezeFilterResult = isFreezeFilterEnabled ? frozenLoans : []

      //? Always include baseLoans, with conditional auction/freeze results
      return [...baseLoans, ...auctionFilterResult, ...freezeFilterResult]
    }

    return applyFilter(filteredBySearchQuery)
  }, [filteredBySearchQuery, isAuctionFilterEnabled, isFreezeFilterEnabled])

  const getLoanAmount = (predicate: LoanPredicate) =>
    _.size(_.filter(filteredBySearchQuery, predicate)) || null

  const auctionLoansAmount = getLoanAmount(isLoanTerminating)
  const freezeLoansAmount = getLoanAmount(isLoanFrozen)

  return {
    filteredLoans,

    searchQuery,
    setSearchQuery,

    auctionLoansAmount,
    freezeLoansAmount,

    isAuctionFilterEnabled,
    toggleAuctionFilter,

    isFreezeFilterEnabled,
    toggleFreezeFilter,
  }
}

//? Selects active loans: listed or selling, and not frozen.
const getBaseLoans = (loans: Loan[]) => {
  const isListedOrSelling = (loan: Loan) => isLoanListed(loan) || isLoanSelling(loan)
  const isNotFrozen = (loan: Loan) => !isLoanFrozen(loan)

  return loans.filter((loan) => isListedOrSelling(loan) && isNotFrozen(loan))
}
