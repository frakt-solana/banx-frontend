import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { convertBondOfferV3ToCore } from '@banx/api'
import { TokenLoan } from '@banx/api/tokens'
import {
  ZERO_BN,
  caclulateBorrowTokenLoanValue,
  calcTokenLoanAprWithRepayFee,
  calculateOfferSize,
} from '@banx/utils'

export const getCurrentLoanInfo = (loan: TokenLoan) => {
  const currentDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentBorrowedAmount = loan.fraktBond.borrowedAmount
  const currentApr = calcTokenLoanAprWithRepayFee(loan)

  const marketUpfrontFee = loan.collateral.upfrontFee

  return {
    currentDebt,
    currentBorrowedAmount,
    currentApr,
    marketUpfrontFee,
  }
}

type CalculateTokensToGet = (props: {
  offer: BondOfferV3
  loan: TokenLoan
  marketTokenDecimals: number
}) => BN

export const calculateTokensToGet: CalculateTokensToGet = ({
  offer,
  loan,
  marketTokenDecimals,
}) => {
  const maxTokenToGet = calculateOfferSize(convertBondOfferV3ToCore(offer))

  const tokenSupply = loan.fraktBond.fbondTokenSupply
  const collateralsPerToken = offer.validation.collateralsPerToken

  if (!tokenSupply || collateralsPerToken.isZero()) return ZERO_BN

  const marketTokenDecimalsMultiplier = new BN(10).pow(new BN(marketTokenDecimals))

  const tokensToGet = BN.min(
    new BN(tokenSupply.toString()).mul(marketTokenDecimalsMultiplier).div(collateralsPerToken),
    maxTokenToGet,
  )

  return tokensToGet
}
