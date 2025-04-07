import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api'
import { SECONDS_IN_DAY } from '@banx/constants'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  isLoanListed,
} from '@banx/utils'

export const calculateLendToBorrowValue = (loan: Loan) => {
  return isLoanListed(loan)
    ? calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
    : caclulateBorrowTokenLoanValue(loan).toNumber()
}

export const calcTokenWeeklyInterest = (loan: Loan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calculateLendToBorrowValue(loan),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds,
  })
}
