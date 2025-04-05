import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { TokenMarketPreview } from '@banx/api'

export enum SortField {
  OFFER_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'In loans', value: [SortField.LOANS_TVL, 'desc'] },
  { label: 'Size', value: [SortField.OFFER_TVL, 'desc'] },
]

type SortValueGetter = (market: TokenMarketPreview) => number

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.OFFER_TVL]: (market) => market.offersTvl,
  [SortField.LOANS_TVL]: (market) => market.loansTvl,
}

export const useMarketsSorting = (markets: TokenMarketPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedMarkets = useMemo(() => {
    if (!sortOption) return markets

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(markets, sortValueGetter, order)
  }, [sortOption, markets])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
