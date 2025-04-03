import { FC } from 'react'

import classNames from 'classnames'

import {
  CollateralTokenCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import NumericInput from '@banx/components/inputs/NumericInput'

import { TokenLoan } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { Pencil } from '@banx/icons'
import {
  HealthColorIncreasing,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
  getTokenLoanSupply,
  isTokenLoanFrozen,
  isTokenLoanListed,
  isTokenLoanSelling,
} from '@banx/utils'

import { calculateLendToBorrowValue } from '../helpers'

import styles from './LenderTokenRefinanceModal.module.scss'

export const CollateralCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  return (
    <CollateralTokenCell
      amount={getTokenLoanSupply(loan)}
      logoUrl={loan.collateral.logoUrl}
      ticker={loan.collateral.ticker}
      collateralPrice={loan.collateralPrice}
      lendingToken={loan.bondTradeTransaction.lendingToken}
    />
  )
}

export const FreezeCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const freezeDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeValue = isTokenLoanFrozen(loan) ? `${freezeDays} days` : '--'

  return <HorizontalCell value={freezeValue} className={styles.bodyCellText} />
}

export const LtvCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)
  const ltv = calculateTokenLoanLtvByLoanValue(loan, lentValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
      className={styles.bodyCellText}
    />
  )
}

interface LiquidationLtvCellProps {
  loan: TokenLoan
  editingLoanPubkey: string | null
  tempLiquidationLtv: string
  setTempLiquidationLtv: (value: string) => void
  onEdit: (loan: TokenLoan) => void
  onSave: (loan: TokenLoan) => void
}

export const LiquidationLtvCell: FC<LiquidationLtvCellProps> = ({
  loan,
  editingLoanPubkey,
  tempLiquidationLtv,
  setTempLiquidationLtv,
  onEdit,
  onSave,
}) => {
  const liquidationLtv = loan.liquidationLtvBp / 100

  const isEditing = editingLoanPubkey === loan.publicKey
  const isOracleMarket = loan.collateral?.oraclePriceFeedType !== 'none'

  //? Lender can edit only if loan is not listed by borrower or lender
  const canEdit = isOracleMarket && !isTokenLoanListed(loan) && !isTokenLoanSelling(loan)

  if (isEditing) {
    return (
      <NumericInput
        className={styles.liqLtvInput}
        value={tempLiquidationLtv}
        onChange={(value) => setTempLiquidationLtv(value)}
        onBlur={() => onSave(loan)}
        placeholder="0"
        autoFocus
      />
    )
  }

  const textColor = liquidationLtv ? getColorByPercent(liquidationLtv, HealthColorIncreasing) : ''

  return (
    <div
      onClick={() => onEdit(loan)}
      className={classNames(styles.liqLtvCell, { [styles.editable]: canEdit })}
    >
      <HorizontalCell
        value={createPercentValueJSX(liquidationLtv)}
        textColor={textColor}
        className={classNames(styles.bodyCellText, {
          [styles.editable]: canEdit && !!liquidationLtv,
        })}
      />
      <Pencil />
    </div>
  )
}
