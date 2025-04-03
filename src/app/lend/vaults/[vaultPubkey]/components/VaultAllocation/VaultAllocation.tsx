import { FC, useMemo } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Table, { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { VaultPreview } from '@banx/api/tokens'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import { TvlProgressIndicator } from '../../../components/TvlProgressIndicator'

import styles from './VaultAllocation.module.scss'

type AssetsAllocation = VaultPreview['assetsAllocation'][0]

const HEADER_ROW_HEIGHT = 40
const ROW_HEIGHT = 48

interface VaultAllocationProps {
  assetsAllocation: AssetsAllocation[]
  lendingToken: LendingTokenType
}

const VaultAllocation: FC<VaultAllocationProps> = ({ assetsAllocation, lendingToken }) => {
  const columns = getTableColumns({ lendingToken })

  const tableHeight = useMemo(
    () => HEADER_ROW_HEIGHT + assetsAllocation.length * ROW_HEIGHT,
    [assetsAllocation],
  )

  return (
    <div style={{ height: tableHeight }}>
      <Table
        data={assetsAllocation}
        columns={columns}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
      />
    </div>
  )
}

export default VaultAllocation

const getTableColumns = ({ lendingToken }: { lendingToken: LendingTokenType }) => {
  const columns: ColumnType<AssetsAllocation>[] = [
    {
      key: 'token',
      title: <HeaderCell label="Allocation" align="left" />,
      render: (allocation) => <AllocationCell allocation={allocation} />,
    },
    {
      key: 'tvl',
      title: (
        <HeaderCell
          label="TVL "
          tooltipText="Total value locked in the token / Percentage of the token’s capacity"
        />
      ),
      render: (allocation) => (
        <TvlProgressIndicator
          totalDepositedAmount={allocation.totalDepositedAmount}
          maxCapacity={allocation.maxCapacity}
          lendingToken={lendingToken}
          className={styles.tvlProgress}
        />
      ),
    },
    {
      key: 'inLoans',
      title: <HeaderCell label="In loans" tooltipText="Total value locked in the loans" />,
      render: (allocation) => (
        <span className={styles.cellText}>
          <DisplayValue value={allocation.loansTvl} strictTokenType={lendingToken} />
        </span>
      ),
    },
    {
      key: 'avgLtv',
      title: (
        <HeaderCell label="Avg LTV" tooltipText="The LTV ratio for all active loans in the vault" />
      ),
      render: (data) => {
        const averageLtv = data.avgLtv / 100
        const color = averageLtv ? getColorByPercent(averageLtv, HealthColorIncreasing) : ''

        return (
          <span style={{ color }} className={styles.cellText}>
            {createPercentValueJSX(averageLtv)}
          </span>
        )
      },
    },
    {
      key: 'liquidationLtv',
      title: (
        <HeaderCell
          label="Liq. ltv"
          tooltipText="The LTV ratio at which loans in the vault are subject to liquidation. It represents the maximum risk threshold"
        />
      ),
      render: (data) => {
        const liquidationLtv = data.liquidationLtv / 100
        return (
          <span
            style={{ color: getColorByPercent(liquidationLtv, HealthColorIncreasing) }}
            className={styles.cellText}
          >
            {createPercentValueJSX(liquidationLtv)}
          </span>
        )
      },
    },
    {
      key: 'apr',
      title: (
        <HeaderCell
          label="Fixed APR"
          tooltipText="The fixed APR for all active offers in the vault"
        />
      ),
      render: (data) => (
        <HorizontalCell value={createPercentValueJSX(data.apr / 100)} isHighlighted />
      ),
    },
  ]

  return columns
}

const AllocationCell: FC<{ allocation: AssetsAllocation }> = ({ allocation }) => {
  const { allocation: allocationBasePoints, logoUrl, ticker } = allocation

  return (
    <div className={styles.tokenCell}>
      <img src={logoUrl} className={styles.tokenInfoImage} />
      <div className={styles.tokenInfo}>
        <span className={styles.tokenInfoAllocation}>
          {createPercentValueJSX(allocationBasePoints / 100)}
        </span>
        <span className={styles.tokenInfoTicker}>{ticker}</span>
      </div>
    </div>
  )
}
