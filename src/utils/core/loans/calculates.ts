import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPure,
  calculateDynamicApr,
  calculateLenderPartialPartFromBorrower,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  calcBorrowerTokenAPR,
  calcRepayFeeAprFromBondTradeTransaction,
} from 'fbonds-core/lib/fbond-protocol/helpers'
import moment from 'moment'

import { Loan, convertBondTradeTransactionToCore } from '@banx/api'
import { DYNAMIC_APR, SECONDS_IN_DAY } from '@banx/constants'

export const getTokenLoanSupply = (loan: Loan) => {
  const { fraktBond, collateral } = loan
  return fraktBond.fbondTokenSupply / Math.pow(10, collateral.decimals)
}

export const calculateTokenLoanLtvByLoanValue = (loan: Loan, value: number) => {
  const collateralSupply = getTokenLoanSupply(loan)
  const ltvRatio = value / collateralSupply

  return (ltvRatio / loan.collateralPrice) * 100
}

/**
  As we need to show how much lender receives.
  We need to calculate this value from repaymentCallAmount (how much borrower should pay)
 */
export const calculateTokenRepaymentCallLenderReceivesAmount = (loan: Loan) => {
  const { repaymentCallAmount, soldAt } = loan.bondTradeTransaction

  return calculateLenderPartialPartFromBorrower({
    borrowerPart: repaymentCallAmount,
    protocolRepayFeeApr: calcTokenLoanAprWithRepayFee(loan),
    soldAt,
    //? Lender APR (without ProtocolFee)
    lenderApr: calculateApr({
      loanValue: repaymentCallAmount,
      collectionFloor: loan.collateralPrice,
      marketPubkey: loan.fraktBond.hadoMarket,
    }),
  })
}

type CalculateApr = (params: {
  loanValue: number
  collectionFloor: number
  marketPubkey?: string
}) => number
/**
 * Returns apr value in base points: 7380 => 73.8%
 */
export const calculateApr: CalculateApr = ({ loanValue, collectionFloor }) => {
  //? exceptions for some collections with hardcoded APR
  const staticApr = Math.floor((loanValue / collectionFloor) * BASE_POINTS) || 0
  return calculateDynamicApr(staticApr, DYNAMIC_APR)
}

export const caclulateBorrowTokenLoanValue = (loan: Loan, upfrontFeeIncluded = true) => {
  const repayValueBN = calculateTokenLoanRepayValueOnCertainDate({
    loan,
    upfrontFeeIncluded,
    date: moment().unix(),
  })

  return repayValueBN
}

type CalculateTokenLoanRepayValueOnCertainDate = (params: {
  loan: Loan
  upfrontFeeIncluded?: boolean
  date: number //? Unix timestamp
}) => BN
/**
 * set upfrontFeeIncluded false for partial repay
 */

export const calculateTokenLoanRepayValueOnCertainDate: CalculateTokenLoanRepayValueOnCertainDate =
  ({ loan, upfrontFeeIncluded = true, date }): BN => {
    const { solAmount, soldAt } = loan.bondTradeTransaction || {}

    const loanValue = upfrontFeeIncluded
      ? calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
      : solAmount

    const calculatedInterest = calculateCurrentInterestSolPure({
      loanValue,
      startTime: soldAt,
      currentTime: date,
      rateBasePoints: calcTokenLoanAprWithRepayFee(loan),
    })

    return new BN(loanValue).add(new BN(calculatedInterest))
  }

export const calculateTokenLoanValueWithUpfrontFee = (loan: Loan) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction
  return new BN(solAmount).add(new BN(feeAmount))
}

export const calculateLentTokenValueWithInterest = (loan: Loan) => {
  const loanValueWithUpfrontFee = calculateTokenLoanValueWithUpfrontFee(loan)
  const accruedInterest = calculateTokenLoanAccruedInterest(loan)

  return loanValueWithUpfrontFee.add(accruedInterest)
}

export const calculateTokenLoanAccruedInterest = (loan: Loan) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanValueWithUpfrontFee = calculateTokenLoanValueWithUpfrontFee(loan)

  const accruedInterest = calculateCurrentInterestSolPure({
    loanValue: loanValueWithUpfrontFee.toNumber(),
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  return new BN(accruedInterest)
}

export const calcTokenWeeklyFeeWithRepayFee = (loan: Loan) => {
  const { soldAt } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calculateTokenLoanValueWithUpfrontFee(loan).toNumber(),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: calcTokenLoanAprWithRepayFee(loan),
  })
}

/**
 *
 * - If addFee = true: We increase the amount to compensate for the fee,
 *   ensuring the user receives the requested amount after the transaction.
 *   For example, sending 10.25 with a 0.25% fee ensures the user gets 10.
 *
 * - If addFee = false: We calculate the net amount after the fee is deducted.
 *   For example, 10 with a 0.25% fee results in 9.75 received.
 */
export const adjustTokenAmountWithUpfrontFee = (amount: BN, upfrontFee: BN, addFee = false): BN => {
  const BASE_POINTS_BN = new BN(BASE_POINTS)

  const adjustedPoints = addFee ? BASE_POINTS_BN.add(upfrontFee) : BASE_POINTS_BN.sub(upfrontFee)
  return amount.mul(adjustedPoints).div(BASE_POINTS_BN)
}

const calcRepayFeeAprForTokenLoan = (loan: Loan): number => {
  const protocolRepayFee = calcRepayFeeAprFromBondTradeTransaction(
    convertBondTradeTransactionToCore(loan.bondTradeTransaction),
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  return protocolRepayFee
}

export const calcTokenLoanAprWithRepayFee = (loan: Loan): number => {
  const baseLoanApr = loan.bondTradeTransaction.amountOfBonds
  const repayAprFee = calcRepayFeeAprForTokenLoan(loan)

  return calcBorrowerTokenAPR(baseLoanApr, repayAprFee)
}

//? ========= APR calculations =========
