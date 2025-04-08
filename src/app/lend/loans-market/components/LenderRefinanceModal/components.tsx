import { FC } from 'react'

import classNames from 'classnames'

import {
  CollateralTokenCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import NumericInput from '@banx/components/inputs/NumericInput'

import { Loan } from '@banx/api'
import { SECONDS_IN_DAY } from '@banx/constants'
import { Pencil } from '@banx/icons'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'
import {
  calculateTokenLoanLtvByLoanValue,
  getTokenLoanSupply,
  isLoanFrozen,
  isLoanListed,
  isLoanSelling,
} from '@banx/utils/core'

import { calculateLendToBorrowValue } from '../../helpers'

import styles from './LenderRefinanceModal.module.scss'

export const CollateralCell: FC<{ loan: Loan }> = ({ loan }) => {
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

export const FreezeCell: FC<{ loan: Loan }> = ({ loan }) => {
  const freezeDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeValue = isLoanFrozen(loan) ? `${freezeDays} days` : '--'

  return <HorizontalCell value={freezeValue} className={styles.bodyCellText} />
}

export const LtvCell: FC<{ loan: Loan }> = ({ loan }) => {
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
  loan: Loan
  editingLoanPubkey: string | null
  tempLiquidationLtv: string
  setTempLiquidationLtv: (value: string) => void
  onEdit: (loan: Loan) => void
  onSave: (loan: Loan) => void
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
  const canEdit = isOracleMarket && !isLoanListed(loan) && !isLoanSelling(loan)

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
