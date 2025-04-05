import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { WSOL_ADDRESS } from '@banx/constants'
import { useTokenPrice } from '@banx/hooks'
import { getTokenDecimals, isUsdcTokenType } from '@banx/utils'

import { SORT_PREVIEW_OPTIONS, SortPreviewField } from '../constants'
import { LoansPreview } from '../types'

export const useLenderLoansPreviewSorting = (loansPreviews: LoansPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_PREVIEW_OPTIONS[0])
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useTokenPrice(WSOL_ADDRESS)

  const sortedLoansPreviews = useMemo(() => {
    if (!sortOption || !tokenPrice || isTokenPriceLoading) return loansPreviews

    const [field, order] = sortOption.value

    const getSortValue = (preview: LoansPreview) => {
      const { lendingToken, totalClaim, totalRepaid, weightedApr, weightedLtv } = preview

      const priceMultiplier = isUsdcTokenType(lendingToken) ? 1 : tokenPrice
      const normalize = (value: number) => value / 10 ** getTokenDecimals(lendingToken)

      if (field === SortPreviewField.CLAIM) return normalize(totalClaim) * priceMultiplier
      if (field === SortPreviewField.LTV) return weightedLtv
      if (field === SortPreviewField.REPAID) return normalize(totalRepaid) * priceMultiplier
      if (field === SortPreviewField.APR) return weightedApr
      return 0
    }

    return orderBy(loansPreviews, getSortValue, order)
  }, [sortOption, tokenPrice, isTokenPriceLoading, loansPreviews])

  const onChangeSortOption = (option: SortOption<SortPreviewField>) => {
    setSortOption(option)
  }

  return {
    sortedLoansPreviews,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_PREVIEW_OPTIONS,
    },
  }
}
