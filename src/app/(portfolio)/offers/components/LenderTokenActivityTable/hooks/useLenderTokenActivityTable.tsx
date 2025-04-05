import { isEmpty } from 'lodash'

import { useTokenType } from '@banx/store/common'

import { useLenderTokenActivity } from './useLenderTokenActivity'

export const useLenderTokenActivityTable = () => {
  const { tokenType, setTokenType } = useTokenType()

  const { loans, isLoading, sortParams, fetchNextPage, hasNextPage } = useLenderTokenActivity()

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
