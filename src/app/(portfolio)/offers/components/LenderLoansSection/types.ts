import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import { Loan } from '@banx/api'

export interface LoansPreview {
  id: string
  collateralMint: string
  collateralTicker: string
  collateralLogoUrl: string
  collateralPrice: number

  totalClaim: number
  totalRepaid: number
  weightedLtv: number
  weightedApr: number
  terminatingLoansAmount: number
  repaymentCallsAmount: number
  sellingLoansAmount: number
  underwaterLoansAmount: number
  liquidatedLoansAmount: number

  lendingToken: LendingTokenType
  oraclePriceFeedType: OraclePriceFeedType

  loans: Loan[]
}
