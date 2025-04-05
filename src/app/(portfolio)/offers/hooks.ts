import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/common'
import { useTokenType } from '@banx/store/common'

export const useUserTokenOffersStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery({
    queryKey: ['userTokenOffersStats', publicKeyString, tokenType],
    queryFn: () =>
      stats.fetchUserOffersStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: 'spl',
      }),
    enabled: !!publicKeyString,
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 1000,
    staleTime: 15 * 1000,
  })

  return {
    data,
    isLoading,
  }
}
