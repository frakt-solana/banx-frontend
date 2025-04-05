import classNames from 'classnames'

import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  DurationCell,
  HeaderCell,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'

import { AprCell, StatusCell } from './cells'

import styles from './LendTokenActivityTable.module.scss'

export const getTableColumns = () => {
  const columns: ColumnType<activity.LenderTokenActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" className={styles.headerCell} />,
      render: ({ id, collateral, tokenSupply }) => (
        <CollateralTokenCell key={id} amount={tokenSupply / Math.pow(10, collateral.decimals)} />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" className={styles.headerCell} />,
      render: (loan) => (
        <span className={classNames(styles.cellTitle, styles.lentCellTitle)}>
          <DisplayValue value={loan.currentRemainingLentAmount} />
        </span>
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" className={styles.headerCell} />,
      render: (loan) => <AprCell loan={loan} />,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
          className={styles.headerCell}
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" className={styles.headerCell} />,
      render: ({ publicKey, timestamp }) => (
        <DurationCell className={styles.cellTitle} publicKey={publicKey} timestamp={timestamp} />
      ),
    },
  ]

  return columns
}
