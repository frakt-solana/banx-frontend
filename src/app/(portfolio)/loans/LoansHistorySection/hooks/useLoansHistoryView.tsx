import _ from 'lodash'

import { useTokenType } from '@banx/store/common'

import { useLoansHistoryData } from './useLoansHistoryData'

export const useLoansHistoryView = () => {
  const { tokenType, setTokenType } = useTokenType()

  const { loans, isLoading, sortParams, fetchNextPage, hasNextPage } = useLoansHistoryData()

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  const isNoLoans = _.isEmpty(loans) && !isLoading

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
