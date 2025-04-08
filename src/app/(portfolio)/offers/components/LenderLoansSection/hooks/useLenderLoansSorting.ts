import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOrder } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api'
import {
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
  isLoanLiquidated,
  isLoanRepaymentCallActive,
  isLoanTerminating,
} from '@banx/utils/core'

import { TableColumnKey } from '../constants'

export type SortColumnOption<T> = { key: T; order: SortOrder }

type SortValueGetter = (loan: Loan) => number

const SORT_OPTIONS: SortColumnOption<TableColumnKey>[] = [
  { key: TableColumnKey.STATUS, order: 'desc' },
  { key: TableColumnKey.CLAIM, order: 'desc' },
  { key: TableColumnKey.LTV, order: 'desc' },
  { key: TableColumnKey.REPAID, order: 'desc' },
  { key: TableColumnKey.APR, order: 'desc' },
]

const SORT_VALUE_MAP: Record<TableColumnKey, string | SortValueGetter> = {
  [TableColumnKey.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [TableColumnKey.CLAIM]: (loan) => calculateLentTokenValueWithInterest(loan).toNumber(),
  [TableColumnKey.LTV]: (loan) => {
    const debtValue = calculateLentTokenValueWithInterest(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, debtValue)
  },
  [TableColumnKey.LIQ_LTV]: (loan) => loan.liquidationLtvBp,
  [TableColumnKey.REPAID]: (loan) => loan.bondTradeTransaction.lenderFullRepaidAmount,
  [TableColumnKey.STATUS]: '',
}

const sortStatusLoans = (loans: Loan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const repaymentCallLoans = chain(loans)
    .filter(isLoanRepaymentCallActive)
    .sortBy((loan) => loan.bondTradeTransaction.repaymentCallAmount)
    .reverse()
    .value()

  const otherLoans = chain(loans)
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

export const useLenderLoansSorting = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const { key, order } = sortOption

    const sortValueGetter = SORT_VALUE_MAP[key]

    return key === TableColumnKey.STATUS
      ? sortStatusLoans(loans, order)
      : orderBy(loans, sortValueGetter, order)
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
