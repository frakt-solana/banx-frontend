import { useMemo, useState } from 'react'

import _ from 'lodash'

import { SortOrder } from '@banx/components/SortDropdown'

import { BorrowOffer } from '.'

export type SortColumnOption<T> = { key: T; order: SortOrder }

type SortValueGetter = (offer: BorrowOffer) => number

export enum ColumnKey {
  MAX_BORROW = 'maxBorrow',
  APR = 'apr',
  LIQ_LTV = 'liq_ltv',
  OFFER_SIZE = 'offerSize',
}

const SORT_OPTIONS: SortColumnOption<ColumnKey>[] = [
  { key: ColumnKey.MAX_BORROW, order: 'desc' },
  { key: ColumnKey.APR, order: 'desc' },
  { key: ColumnKey.LIQ_LTV, order: 'desc' },
  { key: ColumnKey.OFFER_SIZE, order: 'desc' },
]

const SORT_VALUE_MAP: Record<ColumnKey, SortValueGetter> = {
  [ColumnKey.MAX_BORROW]: (offer) => offer.maxBorrow.toNumber(),
  [ColumnKey.APR]: (offer) => parseFloat(offer.apr),
  [ColumnKey.LIQ_LTV]: (offer) => offer.liquidationLtvBp,
  [ColumnKey.OFFER_SIZE]: (offer) => parseFloat(offer.maxTokenToGet),
}

export const useSortedOffers = (offers: BorrowOffer[]) => {
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
