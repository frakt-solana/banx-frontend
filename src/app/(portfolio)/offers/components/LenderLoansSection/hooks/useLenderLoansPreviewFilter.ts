import { useCallback, useMemo, useState } from 'react'

import { sumBy } from 'lodash'

import { MarketTokenType } from '@banx/components/Dropdowns'
import { filterBySearchQuery } from '@banx/components/Search'

import { LoansPreview } from '../types'

export const useLenderLoansPreviewFilter = (loansPreviews: LoansPreview[]) => {
  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [isLiquidatedFilterEnabled, setIsLiquidatedFilterState] = useState(false)
  const [isUnderwaterFilterEnabled, setIsUnderwaterFilterState] = useState(false)

  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleSelectedTokenChange = (value: MarketTokenType) => {
    setSelectedLendingToken(value)
  }

  const toggleTerminationFilter = () => {
    setIsLiquidatedFilterState(false)
    setIsUnderwaterFilterState(false)
    setTerminationFilterState(!isTerminationFilterEnabled)
  }

  const toggleLiquidatedFilter = () => {
    setTerminationFilterState(false)
    setIsUnderwaterFilterState(false)
    setIsLiquidatedFilterState(!isLiquidatedFilterEnabled)
  }

  const toggleUnderwaterFilter = () => {
    setTerminationFilterState(false)
    setIsLiquidatedFilterState(false)
    setIsUnderwaterFilterState(!isUnderwaterFilterEnabled)
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

      if (isUnderwaterFilterEnabled) {
        return previews.filter((preview) => preview.underwaterLoansAmount > 0)
      }

      if (isLiquidatedFilterEnabled) {
        return previews.filter((preview) => preview.liquidatedLoansAmount > 0)
      }

      return previews
    },
    [isTerminationFilterEnabled, isUnderwaterFilterEnabled, isLiquidatedFilterEnabled],
  )

  const filteredLoansPreviews = useMemo(
    () => applyActiveFilters(filteredBySearchQuery),
    [filteredBySearchQuery, applyActiveFilters],
  )

  const terminatingLoansAmount = useMemo(
    () => sumBy(filteredBySearchQuery, (preview) => preview.terminatingLoansAmount || 0),
    [filteredBySearchQuery],
  )

  const liquidatedLoansAmount = useMemo(
    () => sumBy(filteredBySearchQuery, (preview) => preview.liquidatedLoansAmount || 0),
    [filteredBySearchQuery],
  )

  const underwaterLoansAmount = useMemo(
    () => sumBy(filteredBySearchQuery, (preview) => preview.underwaterLoansAmount || 0),
    [filteredBySearchQuery],
  )

  return {
    filteredLoansPreviews,

    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,

    terminatingLoansAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,

    liquidatedLoansAmount,
    isLiquidatedFilterEnabled,
    toggleLiquidatedFilter,

    underwaterLoansAmount,
    isUnderwaterFilterEnabled,
    toggleUnderwaterFilter,
  }
}
