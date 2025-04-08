import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'

import { Loan } from '@banx/api'
import { calculateNetApr } from '@banx/app/multiply/[ticker]/helpers'
import { calcTokenLoanAprWithRepayFee } from '@banx/utils/core'
import { getTokenDecimals } from '@banx/utils/tokens'

export const calculateNetAprByLoan = (loan: Loan, conversionRate: number, collateralYield: BN) => {
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
