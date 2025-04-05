import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import { TokenLoan } from '@banx/api/tokens'

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

  loans: TokenLoan[]
}
