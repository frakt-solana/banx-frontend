import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api'
import { SECONDS_IN_DAY } from '@banx/constants'
import {
  HealthColorIncreasing,
  calcTokenLoanAprWithRepayFee,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
  isTokenLoanFrozen,
} from '@banx/utils'

import { useLoanListingsTransactions } from '../../hooks'

import styles from './LoanListingsTable.module.scss'

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const borrowedValue = loan.fraktBond.borrowedAmount

  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, borrowedValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltvPercent)}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: Loan }> = ({ loan }) => {
  const aprPercent = calcTokenLoanAprWithRepayFee(loan) / 100

  return <HorizontalCell value={createPercentValueJSX(aprPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: Loan }> = ({ loan }) => {
  const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeDuration = isTokenLoanFrozen(loan) ? `${terminationFreezeInDays} days` : '--'

  return <HorizontalCell value={freezeDuration} />
}

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { delist } = useLoanListingsTransactions()

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    delist(loan)
    event.stopPropagation()
  }

  return (
    <Button
      onClick={onButtonClick}
      size={isCardView ? 'large' : 'medium'}
      className={styles.delistButton}
    >
      Delist
    </Button>
  )
}
