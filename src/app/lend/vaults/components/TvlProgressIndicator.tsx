import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { DisplayValue } from '@banx/components/TableComponents'

import styles from '../ClientLendVaultsPage.module.scss'

interface TvlProgressIndicatorProps {
  totalDepositedAmount: number
  maxCapacity: number
  lendingToken: LendingTokenType
  className?: string
}

export const TvlProgressIndicator: FC<TvlProgressIndicatorProps> = ({
  totalDepositedAmount,
  maxCapacity,
  lendingToken,
  className,
}) => {
  const percentage = (totalDepositedAmount / maxCapacity) * 100

  return (
    <div className={classNames(styles.progressContainer, className)}>
      <div className={styles.progressValues}>
        <DisplayValue value={totalDepositedAmount} strictTokenType={lendingToken} />
        <span className={styles.progressPercentage}>{percentage.toFixed(1)}%</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
