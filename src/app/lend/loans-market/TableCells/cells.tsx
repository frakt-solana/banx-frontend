import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
} from '@banx/utils'

import { calculateLendToBorrowValue } from '../helpers'

interface DebtCellProps {
  loan: core.TokenLoan
}

export const DebtCell: FC<DebtCellProps> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)

  return <HorizontalCell value={<DisplayValue value={lentValue} />} />
}

export const LTVCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)
  const ltv = calculateTokenLoanLtvByLoanValue(loan, lentValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  return (
    <HorizontalCell
      value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
      isHighlighted
    />
  )
}
