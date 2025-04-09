import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { activity } from '@banx/api'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE,
} from '@banx/utils/core'

import styles from './LoansHistorySection.module.scss'

interface DebtCellProps {
  loan: activity.BorrowerActivity
  isCardView: boolean
}

export const DebtCell: FC<DebtCellProps> = ({ loan, isCardView }) => {
  const { borrowed, interest, currentRemainingLentAmount } = loan || {}

  const lentAmount = currentRemainingLentAmount || borrowed
  const repayValue = lentAmount + interest

  const formattedRepayValue = <DisplayValue value={repayValue} />
  const formattedFeeValue = <DisplayValue value={interest} />

  return !isCardView ? (
    <div className={styles.debtCell}>
      <span className={styles.debtCellTitle}>{formattedRepayValue}</span>
      <span className={styles.debtCellSubtitle}>{formattedFeeValue} fee</span>
    </div>
  ) : (
    <span>
      {formattedRepayValue} ({formattedFeeValue} fee)
    </span>
  )
}

export const RepaidCell: FC<{ loan: activity.BorrowerActivity }> = ({ loan }) => {
  const { repaid, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <HorizontalCell value="Collateral" />
  }

  return <HorizontalCell value={<DisplayValue value={repaid} placeholder="--" />} />
}

export const StatusCell: FC<{ loan: activity.BorrowerActivity }> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {_.capitalize(loanStatus)}
    </span>
  )
}
