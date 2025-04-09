import { useMemo, useState } from 'react'

import _ from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { WSOL_ADDRESS } from '@banx/constants'
import { useTokenPrice } from '@banx/hooks'
import { getTokenDecimals, isUsdcTokenType } from '@banx/utils/tokens'

import { SORT_OPTIONS } from '../constants'
import { LoansPreview, SortField } from '../types'

export const useLoansPrivewSorting = (loansPreviews: LoansPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useTokenPrice(WSOL_ADDRESS)

  const sortedLoansPreviews = useMemo(() => {
    if (!sortOption || !tokenPrice || isTokenPriceLoading) return loansPreviews

    const [field, order] = sortOption.value

    const getSortValue = (preview: LoansPreview) => {
      const { lendingToken, totalDebt, weightedApr, weightedLtv } = preview

      const priceMultiplier = isUsdcTokenType(lendingToken) ? 1 : tokenPrice
      const normalize = (value: number) => value / 10 ** getTokenDecimals(lendingToken)

      if (field === SortField.APR) return weightedApr
      if (field === SortField.DEBT) return normalize(totalDebt) * priceMultiplier
      if (field === SortField.LTV) return weightedLtv
      return 0
    }

    return _.orderBy(loansPreviews, getSortValue, order)
  }, [sortOption, tokenPrice, isTokenPriceLoading, loansPreviews])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoansPreviews,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
