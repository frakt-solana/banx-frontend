import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { filterBySearchQuery } from '@banx/components/Search'

import { TokenLoan } from '@banx/api/tokens'
import {
  isTokenLoanFrozen,
  isTokenLoanListed,
  isTokenLoanSelling,
  isTokenLoanTerminating,
} from '@banx/utils'

type LoanPredicate = (loan: TokenLoan) => boolean

export const useMarketLoansFilter = (loans: TokenLoan[]) => {
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
    const applyFilter = (sourceLoans: TokenLoan[]) => {
      const baseLoans = getBaseLoans(sourceLoans)
      const auctionLoans = filter(sourceLoans, isTokenLoanTerminating)
      const frozenLoans = filter(sourceLoans, isTokenLoanFrozen)

      const auctionFilterResult = isAuctionFilterEnabled ? auctionLoans : []
      const freezeFilterResult = isFreezeFilterEnabled ? frozenLoans : []

      //? Always include baseLoans, with conditional auction/freeze results
      return [...baseLoans, ...auctionFilterResult, ...freezeFilterResult]
    }

    return applyFilter(filteredBySearchQuery)
  }, [filteredBySearchQuery, isAuctionFilterEnabled, isFreezeFilterEnabled])

  const getLoanAmount = (predicate: LoanPredicate) =>
    size(filter(filteredBySearchQuery, predicate)) || null

  const auctionLoansAmount = getLoanAmount(isTokenLoanTerminating)
  const freezeLoansAmount = getLoanAmount(isTokenLoanFrozen)

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
const getBaseLoans = (loans: TokenLoan[]) => {
  const isListedOrSelling = (loan: TokenLoan) => isTokenLoanListed(loan) || isTokenLoanSelling(loan)
  const isNotFrozen = (loan: TokenLoan) => !isTokenLoanFrozen(loan)

  return loans.filter((loan) => isListedOrSelling(loan) && isNotFrozen(loan))
}
