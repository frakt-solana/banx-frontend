import { isEmpty } from 'lodash'

import { useTokenType } from '@banx/store/common'

import { useBorrowerTokenActivity } from './useTokenBorrowerActivity'

export const useBorrowerTokenActivityTable = () => {
  const { tokenType, setTokenType } = useTokenType()

  const { loans, isLoading, sortParams, fetchNextPage, hasNextPage } = useBorrowerTokenActivity()

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
