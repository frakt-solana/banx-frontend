import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { Loan } from '@banx/api'
import {
  calcWeightedAverage,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
  isLoanLiquidated,
  isLoanRepaymentCallActive,
  isLoanSelling,
  isLoanTerminating,
  isLoanUnderwater,
} from '@banx/utils/core'

import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: Loan[]): LoansPreview[] => {
  const groupedLoans = _.groupBy(
    loans,
    (loan) => `${loan.collateral.mint}-${loan.bondTradeTransaction.lendingToken}`,
  )

  return Object.entries(groupedLoans).map(([key, loans]) => {
    const { collateralPrice = 0, collateral } = _.first(loans) || {}

    const collateralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const weightedLtv = calculateWeightedLtv(loans)
    const weightedApr = calculateWeightedApr(loans)

    const totalClaim = _.sumBy(loans, (loan) =>
      calculateLentTokenValueWithInterest(loan).toNumber(),
    )
    const totalRepaid = _.sumBy(loans, (loan) => loan.bondTradeTransaction.lenderFullRepaidAmount)

    const terminatingLoansAmount = _.size(_.filter(loans, isLoanTerminating))
    const repaymentCallsAmount = _.size(_.filter(loans, isLoanRepaymentCallActive))
    const sellingLoansAmount = _.size(_.filter(loans, isLoanSelling))
    const underwaterLoansAmount = _.size(_.filter(loans, isLoanUnderwater))
    const liquidatedLoansAmount = _.size(_.filter(loans, isLoanLiquidated))

    const [collateralMint, lendingToken] = key.split('-') as [string, LendingTokenType]

    const oraclePriceFeedType = collateral?.oraclePriceFeedType || OraclePriceFeedType.None

    return {
      id: key,
      collateralMint,
      collateralTicker,
      collateralLogoUrl,
      collateralPrice,

      totalClaim,
      totalRepaid,
      weightedLtv,
      weightedApr,
      terminatingLoansAmount,
      repaymentCallsAmount,
      sellingLoansAmount,
      underwaterLoansAmount,
      liquidatedLoansAmount,

      lendingToken,
      oraclePriceFeedType,

      loans,
    }
  })
}

export const calculateWeightedLtv = (loans: Loan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = calculateLentTokenValueWithInterest(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalLoanValues = _.map(loans, (loan) =>
    calculateLentTokenValueWithInterest(loan).toNumber(),
  )

  return calcWeightedAverage(totalLtvValues, totalLoanValues)
}

export const calculateWeightedApr = (loans: Loan[]) => {
  const totalAprValues = _.map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLoanValues = _.map(loans, (loan) =>
    calculateLentTokenValueWithInterest(loan).toNumber(),
  )

  return calcWeightedAverage(totalAprValues, totalLoanValues)
}
