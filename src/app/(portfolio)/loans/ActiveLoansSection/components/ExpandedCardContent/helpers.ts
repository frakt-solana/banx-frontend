import { sumBy } from 'lodash'

import { Loan } from '@banx/api'
import {
  LoanStatus,
  STATUS_LOANS_MAP,
  caclulateBorrowTokenLoanValue,
  calcTokenWeeklyFeeWithRepayFee,
  isLoanRepaymentCallActive,
  isLoanSelling,
} from '@banx/utils/core'

import { calcTokenTotalValueToPay, calculateWeightedApr } from '../../helpers'

export const getPayInterestActionText = (loans: Loan[]) => {
  if (loans.length === 0) return 'Pay'

  const hasActiveRepaymentCall = loans.some(isLoanRepaymentCallActive)
  const noActiveRepaymentCalls = loans.every((loan) => !isLoanRepaymentCallActive(loan))

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
  if (isLoanSelling(loan)) return LoanStatus.Active

  return STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
}
