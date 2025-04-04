import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { activity } from '@banx/api/tokens'

const PAGINATION_LIMIT = 15

export const useVaultActivity = (props: {
  walletPubkey: string
  lendingToken: LendingTokenType
  state: string
}) => {
  const { walletPubkey, lendingToken, state } = props

  const { publicKey } = useWallet()

  const fetchData = async (pageParam: number) => {
    const data = await activity.fetchLenderTokenActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      state: state,
      sortBy: 'timestamp',
      order: 'desc',
      walletPubkey,
      tokenType: lendingToken,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['vaultTokenActivity', publicKey, lendingToken, walletPubkey, state],
    queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
    getPreviousPageParam: (firstPage) => {
      return firstPage.pageParam - 1
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
    },
    staleTime: 60 * 1000,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
    initialPageParam: 0,
  })

  const loans = useMemo(() => {
    return data?.pages?.map((page) => page.data).flat() || []
  }, [data])

  const showEmptyList = !loans?.length && !isLoading

  return {
    loans,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    showEmptyList,
  }
}
