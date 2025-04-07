import {
  calculateCurrentInterestSolPure,
  calculatePartOfLoanBodyFromInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, first, groupBy, map, size, sumBy } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api'
import {
  caclulateBorrowTokenLoanValue,
  calcTokenLoanAprWithRepayFee,
  calcWeightedAverage,
  calculateTokenLoanLtvByLoanValue,
  isBanxSolTokenType,
  isLoanRepaymentCallActive,
  isLoanTerminating,
} from '@banx/utils'

import { PARTIAL_REPAY_ACCOUNT_CREATION_FEE } from './constants'
import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: Loan[]): LoansPreview[] => {
  const groupedLoans = groupBy(
    loans,
    (loan) => `${loan.collateral.mint}-${loan.bondTradeTransaction.lendingToken}`,
  )

  return Object.entries(groupedLoans).map(([key, loans]) => {
    const weightedLtv = calculateWeightedLtv(loans)
    const weightedApr = calculateWeightedApr(loans)

    const { collateralPrice = 0, collateral } = first(loans) || {}

    const collateralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

    const terminatingLoansAmount = size(filter(loans, isLoanTerminating))
    const repaymentCallsAmount = size(filter(loans, isLoanRepaymentCallActive))

    const [collateralMint, lendingToken] = key.split('-') as [string, LendingTokenType]

    const oraclePriceFeedType = collateral?.oraclePriceFeedType || OraclePriceFeedType.None

    return {
      id: key,
      collateralMint,
      collateralTicker,
      collateralLogoUrl,

      collateralPrice,
      totalDebt,
      weightedLtv,
      weightedApr,
      terminatingLoansAmount,
      repaymentCallsAmount,

      loans,
      lendingToken,
      oraclePriceFeedType,
    }
  })
}

export const calculateWeightedLtv = (loans: Loan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalRepayValues = loans.map((loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalLtvValues, totalRepayValues)
}

export const calculateWeightedApr = (loans: Loan[]) => {
  const totalAprValues = map(loans, (loan) => calcTokenLoanAprWithRepayFee(loan) / 100)
  const totalRepayValues = map(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalAprValues, totalRepayValues)
}

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: Loan) => {
  return isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? PARTIAL_REPAY_ACCOUNT_CREATION_FEE
    : 0
}

export const calculateAccruedInterest = (loan: Loan) => {
  const { solAmount, soldAt } = loan.bondTradeTransaction

  const aprRate = calcTokenLoanAprWithRepayFee(loan)

  return calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: aprRate,
  })
}

const calculateUnpaidInterest = (loan: Loan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calculateAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: Loan, iterestToPay: number) => {
  const { soldAt, solAmount } = loan.bondTradeTransaction

  const aprRate = calcTokenLoanAprWithRepayFee(loan)

  const partOfLoan = calculatePartOfLoanBodyFromInterest({
    soldAt,
    iterestToPay,
    rateBasePoints: aprRate,
  })

  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: Loan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: Loan) => {
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTokenTotalValueToPay = (loan: Loan) => {
  if (isLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}
