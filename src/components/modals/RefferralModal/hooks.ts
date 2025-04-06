import { useQuery } from '@tanstack/react-query'

import { user } from '@banx/api/common'

export const useGetUserWalletByRefCode = (refCode: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['refPersonalData', refCode],
    queryFn: () => user.fetchUserWalletByRefCode({ refCode }),
    refetchOnWindowFocus: false,
    staleTime: 5000,
  })

  return { data: data ?? '', isLoading }
}
