import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'

import EmptyList from '@banx/components/EmptyList'
import Table, { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  DurationCell,
  HeaderCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api'
import { MESSAGES } from '@banx/constants/messages'
import { STATUS_LOANS_COLOR_MAP, STATUS_LOANS_MAP } from '@banx/utils/core'

import { useVaultActivity } from './hooks'

import styles from './VaultActivity.module.scss'

interface VaultActivityProps {
  walletPubkey: string
  lendingToken: LendingTokenType
}

const VaultActivity: FC<VaultActivityProps> = ({ walletPubkey, lendingToken }) => {
  const { loans, isLoading, fetchNextPage, hasNextPage, showEmptyList } = useVaultActivity({
    walletPubkey,
    lendingToken,
    state: 'all',
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

export default VaultActivity

const getTableColumns = ({ lendingToken }: { lendingToken: LendingTokenType }) => {
  const columns: ColumnType<activity.LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ id, collateral, tokenSupply }) => (
        <CollateralTokenCell
          key={id}
          amount={tokenSupply / Math.pow(10, collateral.decimals)}
          logoUrl={collateral.logoUrl}
          ticker={collateral.ticker}
          className={styles.collateralTokenCell}
        />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => (
        <span className={styles.cellText}>
          <DisplayValue value={loan.currentRemainingLentAmount} strictTokenType={lendingToken} />
        </span>
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (loan) => (
        <span className={styles.cellText}>{createPercentValueJSX(loan.apr / 100)}</span>
      ),
    },
    {
      key: 'status',
      title: <HeaderCell label="Status" />,
      render: (loan) => {
        const loanStatus = STATUS_LOANS_MAP[loan.status]
        const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus]

        return (
          <span style={{ color: statusColor }} className={styles.cellText}>
            {capitalize(loanStatus)}
          </span>
        )
      },
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" />,
      render: ({ publicKey, timestamp }) => (
        <span className={styles.cellText}>
          <DurationCell className={styles.cellTitle} publicKey={publicKey} timestamp={timestamp} />
        </span>
      ),
    },
  ]

  return columns
}
