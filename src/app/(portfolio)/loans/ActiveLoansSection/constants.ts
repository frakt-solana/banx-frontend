import { SortOption } from '@banx/components/SortDropdown'

import { SortField } from './types'

export const TOOLTIP_TEXTS = {
  PRICE: 'Token market price',
  TOTAL_DEBT: 'Total amount of outstanding debt for the token',
  WLTV: 'Weighted Loan-to-Value ratio (LTV)',
  WAPR: 'Weighted average annual percentage rate (APR)',
}

// * Sorting * //
export const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'WAPR', value: [SortField.APR, 'desc'] },
  { label: 'WLTV', value: [SortField.LTV, 'desc'] },
]

export enum TableColumnKey {
  DEBT = 'debt',
  APR = 'apr',
  LTV = 'ltv',
  LIQ_LTV = 'liq_ltv',
  STATUS = 'status',
  DURATION = 'duration',
}
// * Sorting * //

export const PARTIAL_REPAY_ACCOUNT_CREATION_FEE = 3229 * 1e3
