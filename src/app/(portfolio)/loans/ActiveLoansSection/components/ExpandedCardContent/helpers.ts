import { sumBy } from 'lodash'

import { Loan } from '@banx/api'
import {
  LoanStatus,
  STATUS_LOANS_MAP,
  caclulateBorrowTokenLoanValue,
  calcTokenWeeklyFeeWithRepayFee,
  isTokenLoanRepaymentCallActive,
  isTokenLoanSelling,
} from '@banx/utils'

import { calcTokenTotalValueToPay, calculateWeightedApr } from '../../helpers'

export const getPayInterestActionText = (loans: Loan[]) => {
  if (loans.length === 0) return 'Pay'

  const hasActiveRepaymentCall = loans.some(isTokenLoanRepaymentCallActive)
  const noActiveRepaymentCalls = loans.every((loan) => !isTokenLoanRepaymentCallActive(loan))

  if (hasActiveRepaymentCall && !noActiveRepaymentCalls) return 'Repayment call'
  if (noActiveRepaymentCalls) return 'Pay interest'

  return 'Pay'
}

export const calculateLoansStats = (loans: Loan[]) => {
  const totalSelectedLoans = loans.length

  const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())
  const totalWeeklyFee = sumBy(loans, calcTokenWeeklyFeeWithRepayFee)
  const totalValueToPay = sumBy(loans, calcTokenTotalValueToPay)
  const weightedApr = calculateWeightedApr(loans)

  return { totalSelectedLoans, totalDebt, totalWeeklyFee, totalValueToPay, weightedApr }
}

export const getTokenLoanStatus = (loan: Loan) => {
  //? Show 'Active' since the loan sale doesn't affect the borrower
  if (isTokenLoanSelling(loan)) return LoanStatus.Active

  return STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
}
