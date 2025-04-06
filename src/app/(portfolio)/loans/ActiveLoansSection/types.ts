import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import { Loan } from '@banx/api'

export interface LoansPreview {
  id: string
  collateralMint: string
  collateralTicker: string
  collateralLogoUrl: string

  collateralPrice: number
  totalDebt: number
  weightedLtv: number
  weightedApr: number
  terminatingLoansAmount: number
  repaymentCallsAmount: number

  lendingToken: LendingTokenType
  oraclePriceFeedType: OraclePriceFeedType

  loans: Loan[]
}

export enum SortField {
  APR = 'apr',
  DEBT = 'debt',
  LTV = 'ltv',
}
