import { useMemo, useState } from 'react'

import _ from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api'
import { calculateTokenLoanLtvByLoanValue } from '@banx/utils/core'

import { calculateLendToBorrowValue } from '../helpers'

enum SortField {
  LTV = 'ltv',
  DURATION = 'duration',
  DEBT = 'repayValue',
  APR = 'apr',
  FREEZE = 'freeze',
}

type SortValueGetter = (loan: Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'LTV', value: [SortField.LTV, 'asc'] },
  { label: 'Duration', value: [SortField.DURATION, 'desc'] },
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.LTV]: (loan) => {
    const debtValue = calculateLendToBorrowValue(loan)
    return calculateTokenLoanLtvByLoanValue(loan, debtValue)
  },
  [SortField.DURATION]: (loan) => loan.fraktBond.refinanceAuctionStartedAt,
  [SortField.DEBT]: (loan) => calculateLendToBorrowValue(loan),
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze,
}

export const useMarketLoansSorting = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return _.orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

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
