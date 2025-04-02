import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store'

export const USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY = 'tokenMarketsPreview'

export const useTokenMarketsPreview = (strictTokenType?: LendingTokenType) => {
  const { tokenType: appTokenType } = useTokenType()

  const tokenType = strictTokenType || appTokenType

  const { data, isLoading } = useQuery({
    queryKey: [USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY, tokenType],
    queryFn: () => core.fetchTokenMarketsPreview({ tokenType }),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  })

  return {
    marketsPreview: data || [],
    isLoading,
  }
}
