import { FC, useEffect, useMemo, useRef, useState } from 'react'

import _ from 'lodash'
import { TableVirtuosoHandle } from 'react-virtuoso'

import EmptyList from '@banx/components/EmptyList'
import { SortOrder } from '@banx/components/SortDropdown'
import Table from '@banx/components/Table'

import { CollateralToken } from '@banx/api'
import { bnToNumberSafe } from '@banx/utils/bn'

import { LeverageSimpleOffer } from '../../types'
import { ColumnKey, getTableColumns } from './getTableColumns'

import styles from './OrderBook.module.scss'

interface OrderBookProps {
  simpleOffers: LeverageSimpleOffer[]
  selectedOffer: LeverageSimpleOffer | undefined
  collateral: CollateralToken | undefined
  loading: boolean
}

export const OrderBook: FC<OrderBookProps> = ({
  simpleOffers,
  selectedOffer,
  collateral,
  loading,
}) => {
  const {
    offers: sortedOffers,
    onChangeSortOption,
    selectedSortOption,
  } = useSortedOffers(simpleOffers)

  const columns = getTableColumns({
    collateral,
    onSort: onChangeSortOption,
    selectedSortOption,
  })

  const hasOffers = sortedOffers.length > 0
  const isLoading = !hasOffers && loading

  const rowParams = {
    activeRowParams: [
      {
        condition: (offer: LeverageSimpleOffer) =>
          offer.publicKey.toBase58() === selectedOffer?.publicKey.toBase58(),
        className: styles.selectedOffer,
      },
    ],
  }

  const virtuosoHandleRef = useRef<TableVirtuosoHandle | null>(null)
  const scrollToIndexDebounced = useMemo(
    () =>
      _.debounce(
        (index: number) =>
          virtuosoHandleRef.current?.scrollToIndex({
            index,
            align: 'center',
            behavior: 'smooth',
          }),
        300,
      ),
    [],
  )
  useEffect(() => {
    if (!virtuosoHandleRef.current) return
    if (!selectedOffer) return

    const index = sortedOffers.findIndex(
      (offer) => offer.publicKey.toBase58() === selectedOffer.publicKey.toBase58(),
    )

    scrollToIndexDebounced(index)
  }, [selectedOffer, scrollToIndexDebounced, sortedOffers])

  return (
    <div className={styles.container}>
      <Table
        virtuosoHandleRef={virtuosoHandleRef}
        data={sortedOffers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        loading={isLoading}
        loaderClassName={styles.loader}
        emptyMessage={
          hasOffers ? undefined : (
            <EmptyList message="There are no available offers at the moment" />
          )
        }
      />
    </div>
  )
}

export default OrderBook

export type SortColumnOption<T> = { key: T; order: SortOrder }

type SortValueGetter = (offer: LeverageSimpleOffer) => number

const SORT_OPTIONS: SortColumnOption<ColumnKey>[] = [
  { key: ColumnKey.MULTIPLIER, order: 'desc' },
  { key: ColumnKey.LIQUIDITY, order: 'desc' },
  { key: ColumnKey.APR, order: 'desc' },
]

const SORT_VALUE_MAP: Record<ColumnKey, SortValueGetter> = {
  [ColumnKey.LIQUIDITY]: (offer) => bnToNumberSafe(offer.maxCollateralToReceive),
  [ColumnKey.MULTIPLIER]: (offer) => offer.maxMultiplier,
  [ColumnKey.APR]: (offer) => bnToNumberSafe(offer.apr),
}

const useSortedOffers = (offers: LeverageSimpleOffer[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedOffers = useMemo(() => {
    if (!sortOption) return offers

    const { key, order } = sortOption
    const sortValueGetter = SORT_VALUE_MAP[key]

    return _.orderBy(offers, sortValueGetter, order)
  }, [sortOption, offers])

  const onChangeSortOption = (option: SortColumnOption<ColumnKey>) => {
    setSortOption(option)
  }

  return {
    offers: sortedOffers,
    selectedSortOption: sortOption,
    onChangeSortOption,
  }
}
