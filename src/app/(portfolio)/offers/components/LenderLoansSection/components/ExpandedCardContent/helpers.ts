import { sumBy } from 'lodash'

import { Loan } from '@banx/api'
import {
  LoanStatus,
  STATUS_LOANS_MAP,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanAccruedInterest,
  isTokenLoanLiquidated,
  isTokenLoanSelling,
} from '@banx/utils'

import { calculateWeightedApr, calculateWeightedLtv } from '../../helpers'

export const calculateLoansStats = (loans: Loan[]) => {
  const totalSelectedLoans = loans.length

  const totalClaim = sumBy(loans, (loan) => calculateLentTokenValueWithInterest(loan).toNumber())
  const totalInterest = sumBy(loans, (loan) => calculateTokenLoanAccruedInterest(loan).toNumber())

  const weightedApr = calculateWeightedApr(loans)
  const weightedLtv = calculateWeightedLtv(loans)

  return { totalSelectedLoans, totalClaim, totalInterest, weightedApr, weightedLtv }
}

export const getTokenLoanStatus = (loan: Loan) => {
  if (isTokenLoanLiquidated(loan) && !isTokenLoanSelling(loan)) {
    return LoanStatus.Liquidated
  }

  return STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
}
