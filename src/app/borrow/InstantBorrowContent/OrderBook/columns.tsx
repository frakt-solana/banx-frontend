import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { CollateralToken } from '@banx/api'

import { BorrowOffer, ColumnKey, SortColumnOption } from '../hooks'
import { AprCell, MaxBorrowCell } from './cells'

import styles from './OrderBook.module.scss'

type GetTableColumns = (props: {
  selectedOffer: BorrowOffer | null
  collateral: CollateralToken | undefined
  onSort: (value: SortColumnOption<ColumnKey>) => void
  selectedSortOption: SortColumnOption<ColumnKey>
}) => ColumnType<BorrowOffer>[]

export const getTableColumns: GetTableColumns = ({
  selectedOffer,
  collateral,
  onSort,
  selectedSortOption,
}) => {
  const columns: ColumnType<BorrowOffer>[] = [
    {
      key: ColumnKey.MAX_BORROW,
      title: (
        <HeaderCell
          label="Max borrow"
          align="left"
          columnKey={ColumnKey.MAX_BORROW}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
          tooltipText="The maximum amount of tokens you can borrow based on your available collateral"
        />
      ),
      render: (offer) => (
        <MaxBorrowCell offer={offer} collateral={collateral} selectedOffer={selectedOffer} />
      ),
    },
    {
      key: ColumnKey.APR,
      title: (
        <HeaderCell
          label="APR"
          className={styles.headerCellCenter}
          columnKey={ColumnKey.APR}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer) => <AprCell offer={offer} collateral={collateral} />,
    },
    {
      key: ColumnKey.LIQ_LTV,
      title: (
        <HeaderCell
          label="Liq. LTV"
          className={styles.headerCellCenter}
          columnKey={ColumnKey.LIQ_LTV}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer: BorrowOffer) => (
        <span className={styles.cellTextCenter}>
          {createPercentValueJSX(offer.liquidationLtvBp / 100)}
        </span>
      ),
    },
    {
      key: ColumnKey.OFFER_SIZE,
      title: (
        <HeaderCell
          label="Size"
          columnKey={ColumnKey.OFFER_SIZE}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (offer) => (
        <span className={styles.cellTextValue}>
          <DisplayValue value={parseFloat(offer.maxTokenToGet)} />
        </span>
      ),
    },
  ]

  return columns
}
