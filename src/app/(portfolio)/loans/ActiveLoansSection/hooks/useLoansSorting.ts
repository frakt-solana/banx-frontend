import { useMemo, useState } from 'react'

import _ from 'lodash'

import { SortOrder } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanLtvByLoanValue,
  isLoanLiquidated,
  isLoanRepaymentCallActive,
  isLoanTerminating,
} from '@banx/utils'

import { TableColumnKey } from '../constants'

export type SortColumnOption<T> = { key: T; order: SortOrder }

type SortValueGetter = (loan: Loan) => number

const SORT_OPTIONS: SortColumnOption<TableColumnKey>[] = [
  { key: TableColumnKey.STATUS, order: 'desc' },
  { key: TableColumnKey.APR, order: 'desc' },
  { key: TableColumnKey.DEBT, order: 'desc' },
  { key: TableColumnKey.DURATION, order: 'desc' },
  { key: TableColumnKey.LTV, order: 'desc' },
]

const SORT_VALUE_MAP: Record<TableColumnKey, string | SortValueGetter> = {
  [TableColumnKey.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [TableColumnKey.DEBT]: (loan) => caclulateBorrowTokenLoanValue(loan).toNumber(),
  [TableColumnKey.DURATION]: (loan) => loan.fraktBond.activatedAt * -1,
  [TableColumnKey.LTV]: (loan) => {
    const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, debtValue)
  },
  [TableColumnKey.LIQ_LTV]: (loan) => loan.liquidationLtvBp,
  [TableColumnKey.STATUS]: '',
}

const sortStatusLoans = (loans: Loan[], order: SortOrder) => {
  const terminatingLoans = _.chain(loans)
    .filter(isLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const repaymentCallLoans = _.chain(loans)
    .filter(isLoanRepaymentCallActive)
    .sortBy((loan) => loan.bondTradeTransaction.repaymentCallAmount)
    .reverse()
    .value()

  const otherLoans = _.chain(loans)
    .filter(
      (loan) =>
        !isLoanTerminating(loan) && !isLoanLiquidated(loan) && !isLoanRepaymentCallActive(loan),
    )
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...repaymentCallLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useLoansSorting = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const { key, order } = sortOption

    const sortValueGetter = SORT_VALUE_MAP[key]

    return key === TableColumnKey.STATUS
      ? sortStatusLoans(loans, order)
      : _.orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

  const onChangeSortOption = (option: SortColumnOption<TableColumnKey>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    selectedSortOption: sortOption,
    onChangeSortOption,
  }
}
