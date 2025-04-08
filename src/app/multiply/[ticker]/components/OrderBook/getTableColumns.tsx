import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'

import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { CollateralToken } from '@banx/api'
import { bnToNumberSafe } from '@banx/utils/bn'

import { LeverageSimpleOffer } from '../../types'
import { SortColumnOption } from './OrderBook'

import styles from './OrderBook.module.scss'

export enum ColumnKey {
  LIQUIDITY = 'liquidity',
  MULTIPLIER = 'multiplier',
  APR = 'apr',
}

type GetTableColumns = (props: {
  collateral: CollateralToken | undefined
  onSort: (value: SortColumnOption<ColumnKey>) => void
  selectedSortOption: SortColumnOption<ColumnKey>
}) => ColumnType<LeverageSimpleOffer>[]

export const getTableColumns: GetTableColumns = ({ collateral, onSort, selectedSortOption }) => {
  const columns: ColumnType<LeverageSimpleOffer>[] = [
    {
      key: ColumnKey.LIQUIDITY,
      title: (
        <HeaderCell
          label="Liquidity"
          align="left"
          columnKey={ColumnKey.LIQUIDITY}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer) => {
        const collateralDecimals = collateral?.collateral.decimals || 0
        return (
          <span>
            {(bnToNumberSafe(offer.maxCollateralToReceive) / 10 ** collateralDecimals).toFixed(2)}
          </span>
        )
      },
    },
    {
      key: ColumnKey.MULTIPLIER,
      title: (
        <HeaderCell
          label="Max multiply"
          className={styles.multiplierHeaderCell}
          columnKey={ColumnKey.MULTIPLIER}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer) => {
        return <span className={styles.multiplierCell}>x{offer.maxMultiplier}</span>
      },
    },
    {
      key: ColumnKey.APR,
      title: (
        <HeaderCell
          label="APR"
          columnKey={ColumnKey.APR}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer) => {
        const marketInterestFee = collateral?.collateral.interestFee || 0
        const aprPercent = calcBorrowerTokenAPR(offer.apr.toNumber(), marketInterestFee) / 100
        return <span>{aprPercent.toFixed(1)}%</span>
      },
    },
  ]

  return columns
}
