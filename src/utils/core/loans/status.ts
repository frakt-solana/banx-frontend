import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { Loan } from '@banx/api'
import { SECONDS_IN_72_HOURS } from '@banx/constants'

import {
  caclulateBorrowTokenLoanValue,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
} from './calculates'

const stateEquals = (loan: Loan, ...states: BondTradeTransactionV2State[]) =>
  states.includes(loan.bondTradeTransaction.bondTradeTransactionState)

export const isLoanFrozen = (loan: Loan) => !!loan.bondTradeTransaction.terminationFreeze

export const isLoanListed = (loan: Loan) =>
  stateEquals(loan, BondTradeTransactionV2State.PerpetualBorrowerListing)

export const isLoanRepaid = (loan: Loan) =>
  stateEquals(loan, BondTradeTransactionV2State.PerpetualRepaid)

export const isLoanTerminating = (loan: Loan) =>
  stateEquals(loan, BondTradeTransactionV2State.PerpetualManualTerminating)

export const isLoanSelling = (loan: Loan) =>
  stateEquals(loan, BondTradeTransactionV2State.PerpetualSellingLoan)

export const isLoanActive = (loan: Loan) =>
  stateEquals(
    loan,
    BondTradeTransactionV2State.PerpetualActive,
    BondTradeTransactionV2State.PerpetualRefinancedActive,
  )

export const isLoanLiquidated = (loan: Loan) => {
  if (!loan.fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()
  const expiredAt = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
  return currentTimeInSeconds > expiredAt
}

export const isLoanUnderwater = (loan: Loan) => {
  const LTV_THRESHOLD = 100

  const loanValue = calculateLentTokenValueWithInterest(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, loanValue)
  return ltvPercent > LTV_THRESHOLD
}

export const isLoanRepaymentCallActive = (loan: Loan) => {
  const { repaymentCallAmount } = loan.bondTradeTransaction
  if (!repaymentCallAmount || isLoanTerminating(loan)) return false

  const repayValue = caclulateBorrowTokenLoanValue(loan).toNumber()
  return !!(repaymentCallAmount / repayValue)
}
