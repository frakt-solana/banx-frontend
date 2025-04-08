import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'

import { Loan } from '@banx/api'
import { getTokenDecimals } from '@banx/utils/tokens'

/**
 * @returns user collateral amount with decimals
 */
export const calculateUserCollateralAmount = (loan: Loan) => {
  const leverage = loan.fraktBond.leverageBasePoints / BASE_POINTS / 100
  const totalLoanCollateralAmount = loan.fraktBond.fbondTokenSupply

  return totalLoanCollateralAmount / leverage
}

/**
 * @returns initialCollateralRate as float number
 */
export const calculateInitialCollateralRate = (loan: Loan) => {
  const collateralDecimals = loan.collateral.decimals
  const tokenDecimals = getTokenDecimals(loan.bondTradeTransaction.lendingToken)

  const fullLoanCollateralAmount = loan.fraktBond.fbondTokenSupply / 10 ** collateralDecimals
  const userCollateralAmountHuman = calculateUserCollateralAmount(loan) / 10 ** collateralDecimals
  const boughtPartCollateralHuman = fullLoanCollateralAmount - userCollateralAmountHuman

  const tokenLentAmountHuman = loan.bondTradeTransaction.borrowerOriginalLent / 10 ** tokenDecimals

  const initialCollateralRate = boughtPartCollateralHuman / tokenLentAmountHuman

  return initialCollateralRate
}
