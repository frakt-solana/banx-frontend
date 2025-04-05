import { SortOption } from '@banx/components/SortDropdown'

export const TOOLTIP_TEXTS = {
  CLAIM: 'Sum of lent amount and accrued interest to date, less any repayments',
  WLTV: 'Weighted Loan-to-Value ratio (LTV)',

  REPAID:
    'Repayments returned to the vault and can be claimed from the offers tab or profile modal',
  WAPR: 'Weighted average annual percentage rate (APR)',
}

// * Sorting * //
export enum SortPreviewField {
  CLAIM = 'claim',
  LTV = 'ltv',
  REPAID = 'repaid',
  APR = 'apr',
}

export const SORT_PREVIEW_OPTIONS: SortOption<SortPreviewField>[] = [
  { label: 'Claim', value: [SortPreviewField.CLAIM, 'desc'] },
  { label: 'WLTV', value: [SortPreviewField.LTV, 'desc'] },
  { label: 'Repaid', value: [SortPreviewField.REPAID, 'desc'] },
  { label: 'WAPR', value: [SortPreviewField.APR, 'desc'] },
]

export enum TableColumnKey {
  CLAIM = 'claim',
  LTV = 'ltv',
  LIQ_LTV = 'liq_ltv',
  REPAID = 'repaid',
  APR = 'apr',
  STATUS = 'status',
}
// * Sorting * //
