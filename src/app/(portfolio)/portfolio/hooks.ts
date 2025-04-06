import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { AssetType, user } from '@banx/api/common'
import { useTokenType } from '@banx/store'

export const useUserPortfolio = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery({
    queryKey: ['userPortfolio', walletPubkey, tokenType],
    queryFn: () => user.fetchUserPortfolio({ walletPubkey, tokenType, assetType: AssetType.SPL }),
    enabled: !!walletPubkey,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  return { data, isLoading }
}
