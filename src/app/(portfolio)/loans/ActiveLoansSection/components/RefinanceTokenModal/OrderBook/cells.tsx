import { FC } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api'
import {
  adjustTokenAmountWithUpfrontFee,
  bnToNumberSafe,
  caclulateBorrowTokenLoanValue,
  calcOfferLtvPercent,
  formatTokensPerCollateral,
  getTokenDecimals,
} from '@banx/utils'

import { calculateTokensToGet } from '../helpers'

import styles from './OrderBook.module.scss'

interface BorrowCellProps {
  loan: Loan
  offer: BondOfferV3
}

export const BorrowCell: FC<BorrowCellProps> = ({ loan, offer }) => {
  const lendingToken = loan.bondTradeTransaction.lendingToken

  const lendingTokenDecimals = getTokenDecimals(lendingToken)
  const marketUpfrontFee = new BN(loan.collateral.upfrontFee)

  const loanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals: lendingTokenDecimals })
  const borrowValue = adjustTokenAmountWithUpfrontFee(loanDebt, marketUpfrontFee)

  const tokensPerCollateral = formatTokensPerCollateral(
    calculateTokensPerCollateralFloat(
      bnToNumberSafe(offer.validation.collateralsPerToken),
      loan.collateral.decimals,
      lendingTokenDecimals,
    ),
    lendingTokenDecimals,
  )

  const ltvPercent = calcOfferLtvPercent({
    tokensPerCollateral: parseFloat(tokensPerCollateral),
    collateralPrice: loan.collateralPrice,
    lendingTokenDecimals,
  })

  return (
    <div className={styles.borrowValueInfo}>
      <DisplayValue value={borrowValue.toNumber()} strictTokenType={lendingToken} />
      <span className={styles.cellValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}

interface AprCellProps {
  offer: BondOfferV3
  loan: Loan
}

export const AprCell: FC<AprCellProps> = ({ offer, loan }) => {
  const offerApr = calcBorrowerTokenAPR(offer.loanApr.toNumber(), loan.collateral.interestFee)
  const offerAprPercent = offerApr / 100

  return <span className={styles.cellValue}>{createPercentValueJSX(offerAprPercent)}</span>
}

interface DebtCellProps {
  loan: Loan
  offer: BondOfferV3
}

export const DebtCell: FC<DebtCellProps> = ({ offer, loan }) => {
  const lendingToken = loan.bondTradeTransaction.lendingToken

  const marketTokenDecimals = getTokenDecimals(lendingToken) //? 9,6
  const loanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals })

  return (
    <span className={styles.cellValue}>
      <DisplayValue value={loanDebt.toNumber()} strictTokenType={lendingToken} />
    </span>
  )
}

interface ActionCellProps {
  loan: Loan
  offer: BondOfferV3
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
}

export const ActionCell: FC<ActionCellProps> = ({ loan, offer, refinance }) => {
  const { lendingToken } = loan.bondTradeTransaction

  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const marketTokenDecimals = getTokenDecimals(lendingToken)

  const newLoanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals })
  const newLoanDebtNumber = newLoanDebt.toNumber()

  const debtDifference = newLoanDebtNumber - currentLoanDebt
  const upfrontFee = Math.max(debtDifference / 100, 0)
  const payableDifference = debtDifference - upfrontFee

  const isNegative = payableDifference < 0
  const absoluteDisplayValue = Math.abs(payableDifference)
  const shouldShowSign = absoluteDisplayValue !== 0
  const sign = isNegative ? '-' : '+'

  return (
    <Button
      onClick={() => refinance(offer, newLoanDebt)}
      variant="secondary"
      size="medium"
      className={classNames(styles.refinanceModalButton, {
        [styles.negative]: isNegative,
      })}
    >
      <p>Rollover</p>
      <p className={styles.differenceValue}>
        {shouldShowSign && sign}
        <DisplayValue value={absoluteDisplayValue} strictTokenType={lendingToken} />
      </p>
    </Button>
  )
}
