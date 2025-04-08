import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api'
import { WSOL_ADDRESS } from '@banx/constants'
import { useTokenPrice } from '@banx/hooks'
import { calculateTokenLoanLtvByLoanValue } from '@banx/utils/core'
import { getTokenDecimals, isUsdcTokenType } from '@banx/utils/tokens'

enum SortField {
  BORROW = 'borrow',
  APR = 'apr',
  LTV = 'ltv',
  FREEZE = 'freeze',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

export const useLoanListingsSorting = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useTokenPrice(WSOL_ADDRESS)

  const sortedLoans = useMemo(() => {
    if (!sortOption || !tokenPrice || isTokenPriceLoading) return loans

    const [field, order] = sortOption.value

    const getSortValue = (loan: Loan) => {
      const { bondTradeTransaction, fraktBond } = loan

      const lendingToken = bondTradeTransaction.lendingToken
      const priceMultiplier = isUsdcTokenType(lendingToken) ? 1 : tokenPrice
      const normalize = (value: number) => value / 10 ** getTokenDecimals(lendingToken)

      if (field === SortField.BORROW) return normalize(fraktBond.borrowedAmount) * priceMultiplier
      if (field === SortField.APR) return bondTradeTransaction.amountOfBonds
      if (field === SortField.LTV)
        return calculateTokenLoanLtvByLoanValue(loan, fraktBond.borrowedAmount)
      if (field === SortField.FREEZE) return bondTradeTransaction.terminationFreeze
      return 0
    }

    return orderBy(loans, getSortValue, order)
  }, [sortOption, tokenPrice, isTokenPriceLoading, loans])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
