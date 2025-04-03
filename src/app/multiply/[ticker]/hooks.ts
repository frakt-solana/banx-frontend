import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'

export const useMultiplyMarketData = (marketPublicKey: string, minPositionSize = 0) => {
  const { data, isLoading } = useQuery({
    queryKey: ['fetchMultiplyMarketData', marketPublicKey, minPositionSize],
    queryFn: () => core.fetchMultiplyMarketData({ marketPubkey: marketPublicKey, minPositionSize }),
    enabled: !!marketPublicKey,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  })

  return { data, isLoading }
}
