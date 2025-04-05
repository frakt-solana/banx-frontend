import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import EmptyList from '@banx/components/EmptyList'
import Table, { ColumnType } from '@banx/components/Table'
import { DisplayValue, DurationCell, HeaderCell } from '@banx/components/TableComponents'

import { activity } from '@banx/api'
import { MESSAGES } from '@banx/constants/messages'

import { useVaultActivity } from '../VaultActivity/hooks'

import styles from './VaultPerformance.module.scss'

interface VaultPerformanceProps {
  walletPubkey: string
  lendingToken: LendingTokenType
}

const VaultPerformance: FC<VaultPerformanceProps> = ({ walletPubkey, lendingToken }) => {
  const { loans, isLoading, fetchNextPage, hasNextPage, showEmptyList } = useVaultActivity({
    walletPubkey,
    lendingToken,
    state: 'vault',
  })

  const columns = getTableColumns({ lendingToken })

  return (
    <Table
      data={loans}
      columns={columns}
      loading={isLoading}
      loadMore={hasNextPage ? fetchNextPage : undefined}
      className={styles.tableRoot}
      classNameTableWrapper={styles.tableWrapper}
      emptyMessage={
        showEmptyList ? <EmptyList message={MESSAGES.NO_LENDING_ACTIVITY} /> : undefined
      }
    />
  )
}

export default VaultPerformance

const getTableColumns = ({ lendingToken }: { lendingToken: LendingTokenType }) => {
  const columns: ColumnType<activity.LenderTokenActivity>[] = [
    {
      key: 'performance',
      title: <HeaderCell label="Performance" align="left" />,
      render: (loan) => {
        const isPositive = loan.currentRemainingLentAmount > 0
        const cellClass = classNames(styles.cellText, {
          [styles.cellTextGreen]: isPositive,
          [styles.cellTextRed]: !isPositive,
        })

        return (
          <span className={cellClass}>
            {isPositive ? '+' : ''}
            <DisplayValue value={loan.currentRemainingLentAmount} strictTokenType={lendingToken} />
          </span>
        )
      },
    },
    {
      key: 'when',
      title: <HeaderCell label="When" />,
      render: ({ publicKey, timestamp }) => (
        <span className={styles.cellText}>
          <DurationCell publicKey={publicKey} timestamp={timestamp} />
        </span>
      ),
    },
  ]

  return columns
}
