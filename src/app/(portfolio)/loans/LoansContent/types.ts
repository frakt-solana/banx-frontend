import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import { TokenLoan } from '@banx/api/tokens'

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

  loans: TokenLoan[]
}

export enum SortField {
  APR = 'apr',
  DEBT = 'debt',
  LTV = 'ltv',
}
