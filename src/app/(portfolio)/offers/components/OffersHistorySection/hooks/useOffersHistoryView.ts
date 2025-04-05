import { isEmpty } from 'lodash'

import { useTokenType } from '@banx/store/common'

import { useOffersHistoryData } from './useOffersHistoryData'

export const useOffersHistoryView = () => {
  const { tokenType, setTokenType } = useTokenType()

  const { loans, isLoading, sortParams, fetchNextPage, hasNextPage } = useOffersHistoryData()

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  const isNoLoans = isEmpty(loans) && !isLoading

  return {
    loans,
    loading: isLoading,
    isNoLoans,
    tokenType,
    setTokenType,
    sortViewParams: {
      sortParams,
    },
    loadMore,
  }
}
