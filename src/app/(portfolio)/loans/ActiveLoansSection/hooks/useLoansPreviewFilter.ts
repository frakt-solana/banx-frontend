import { useCallback, useMemo, useState } from 'react'

import { sumBy } from 'lodash'

import { MarketTokenType } from '@banx/components/Dropdowns'
import { filterBySearchQuery } from '@banx/components/Search'

import { LoansPreview } from '../types'

export const useLoansPreviewFilter = (loansPreviews: LoansPreview[]) => {
  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [isRepaymentCallFilterEnabled, setIsRepaymentCallFilterState] = useState(false)

  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleSelectedTokenChange = (value: MarketTokenType) => {
    setSelectedLendingToken(value)
  }

  const toggleTerminationFilter = () => {
    setIsRepaymentCallFilterState(false)
    setTerminationFilterState(!isTerminationFilterEnabled)
  }

  const toggleRepaymentCallFilter = () => {
    setTerminationFilterState(false)
    setIsRepaymentCallFilterState(!isRepaymentCallFilterEnabled)
  }

  const filteredByLendingToken = useMemo(() => {
    if (selectedLendingToken === 'ALL') return loansPreviews
    return loansPreviews.filter((preview) => preview.lendingToken === selectedLendingToken)
  }, [loansPreviews, selectedLendingToken])

  const filteredBySearchQuery = useMemo(() => {
    return filterBySearchQuery(filteredByLendingToken, searchQuery, [
      (preview) => preview.collateralMint,
      (preview) => preview.collateralTicker,
    ])
  }, [filteredByLendingToken, searchQuery])

  const applyActiveFilters = useCallback(
    (previews: LoansPreview[]) => {
      if (isTerminationFilterEnabled) {
        return previews.filter((preview) => preview.terminatingLoansAmount > 0)
      }

      if (isRepaymentCallFilterEnabled) {
        return previews.filter((preview) => preview.repaymentCallsAmount > 0)
      }

      return previews
    },
    [isTerminationFilterEnabled, isRepaymentCallFilterEnabled],
  )

  const filteredLoansPreviews = useMemo(
    () => applyActiveFilters(filteredBySearchQuery),
    [filteredBySearchQuery, applyActiveFilters],
  )

  const terminatingLoansAmount = useMemo(
    () => sumBy(filteredBySearchQuery, (preview) => preview.terminatingLoansAmount || 0),
    [filteredBySearchQuery],
  )

  const repaymentCallsAmount = useMemo(
    () => sumBy(filteredBySearchQuery, (preview) => preview.repaymentCallsAmount || 0),
    [filteredBySearchQuery],
  )

  return {
    filteredLoansPreviews,

    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,

    terminatingLoansAmount,
    repaymentCallsAmount,

    isTerminationFilterEnabled,
    toggleTerminationFilter,

    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
  }
}
