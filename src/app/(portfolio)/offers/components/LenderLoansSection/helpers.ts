import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, first, groupBy, map, size, sumBy } from 'lodash'

import { TokenLoan } from '@banx/api'
import {
  calcWeightedAverage,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
  isTokenLoanLiquidated,
  isTokenLoanRepaymentCallActive,
  isTokenLoanSelling,
  isTokenLoanTerminating,
  isTokenLoanUnderWater,
} from '@banx/utils'

import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: TokenLoan[]): LoansPreview[] => {
  const groupedLoans = groupBy(
    loans,
    (loan) => `${loan.collateral.mint}-${loan.bondTradeTransaction.lendingToken}`,
  )

  return Object.entries(groupedLoans).map(([key, loans]) => {
    const { collateralPrice = 0, collateral } = first(loans) || {}

    const collateralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const weightedLtv = calculateWeightedLtv(loans)
    const weightedApr = calculateWeightedApr(loans)

    const totalClaim = sumBy(loans, (loan) => calculateLentTokenValueWithInterest(loan).toNumber())
    const totalRepaid = sumBy(loans, (loan) => loan.bondTradeTransaction.lenderFullRepaidAmount)

    const terminatingLoansAmount = size(filter(loans, isTokenLoanTerminating))
    const repaymentCallsAmount = size(filter(loans, isTokenLoanRepaymentCallActive))
    const sellingLoansAmount = size(filter(loans, isTokenLoanSelling))
    const underwaterLoansAmount = size(filter(loans, isTokenLoanUnderWater))
    const liquidatedLoansAmount = size(filter(loans, isTokenLoanLiquidated))

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

export const calculateWeightedLtv = (loans: TokenLoan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = calculateLentTokenValueWithInterest(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalLoanValues = map(loans, (loan) => calculateLentTokenValueWithInterest(loan).toNumber())

  return calcWeightedAverage(totalLtvValues, totalLoanValues)
}

export const calculateWeightedApr = (loans: TokenLoan[]) => {
  const totalAprValues = map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLoanValues = map(loans, (loan) => calculateLentTokenValueWithInterest(loan).toNumber())

  return calcWeightedAverage(totalAprValues, totalLoanValues)
}
