import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'

import { TokenLoan } from '@banx/api/tokens'
import { calculateNetApr } from '@banx/app/multiply/[ticker]/helpers'
import { calcTokenLoanAprWithRepayFee, getTokenDecimals } from '@banx/utils'

export const calculateNetAprByLoan = (
  loan: TokenLoan,
  conversionRate: number,
  collateralYield: BN,
) => {
  const { decimals: collateralDecimals } = loan.collateral
  const tokenDecimals = getTokenDecimals(loan.bondTradeTransaction.lendingToken)
  const aprRate = calcTokenLoanAprWithRepayFee(loan)

  const leverage = loan.fraktBond.leverageBasePoints / BASE_POINTS / 100
  const userCollateralAmount = new BN(loan.fraktBond.fbondTokenSupply / leverage)

  return calculateNetApr({
    totalCollateralAmount: new BN(loan.fraktBond.fbondTokenSupply),
    userEnteredCollateralAmount: userCollateralAmount,
    conversionRate,
    collateralYield,
    aprRate,
    tokenDecimals,
    collateralDecimals,
  })
}
