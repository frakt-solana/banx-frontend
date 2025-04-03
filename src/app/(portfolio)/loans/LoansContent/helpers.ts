import {
  calculateCurrentInterestSolPure,
  calculatePartOfLoanBodyFromInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, first, groupBy, map, size, sumBy } from 'lodash'
import moment from 'moment'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calcTokenLoanAprWithRepayFee,
  calcWeightedAverage,
  calculateTokenLoanLtvByLoanValue,
  isBanxSolTokenType,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { PARTIAL_REPAY_ACCOUNT_CREATION_FEE } from './constants'
import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: TokenLoan[]): LoansPreview[] => {
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

    const terminatingLoansAmount = size(filter(loans, isTokenLoanTerminating))
    const repaymentCallsAmount = size(filter(loans, isTokenLoanRepaymentCallActive))

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

export const calculateWeightedLtv = (loans: TokenLoan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalRepayValues = loans.map((loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalLtvValues, totalRepayValues)
}

export const calculateWeightedApr = (loans: TokenLoan[]) => {
  const totalAprValues = map(loans, (loan) => calcTokenLoanAprWithRepayFee(loan) / 100)
  const totalRepayValues = map(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalAprValues, totalRepayValues)
}

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: TokenLoan) => {
  return isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? PARTIAL_REPAY_ACCOUNT_CREATION_FEE
    : 0
}

export const calculateAccruedInterest = (loan: TokenLoan) => {
  const { solAmount, soldAt } = loan.bondTradeTransaction

  const aprRate = calcTokenLoanAprWithRepayFee(loan)

  return calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: aprRate,
  })
}

const calculateUnpaidInterest = (loan: TokenLoan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calculateAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: TokenLoan, iterestToPay: number) => {
  const { soldAt, solAmount } = loan.bondTradeTransaction

  const aprRate = calcTokenLoanAprWithRepayFee(loan)

  const partOfLoan = calculatePartOfLoanBodyFromInterest({
    soldAt,
    iterestToPay,
    rateBasePoints: aprRate,
  })

  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: TokenLoan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: TokenLoan) => {
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTokenTotalValueToPay = (loan: TokenLoan) => {
  if (isTokenLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}
