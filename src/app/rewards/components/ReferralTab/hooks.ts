import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { user } from '@banx/api/common'

export const useRefPersonalData = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery({
    queryKey: ['refPersonalData', walletPubkey],
    queryFn: () => {
      return user.fetchRefPersonalData({ walletPubkey })
    },
    staleTime: 5000,
    refetchOnWindowFocus: false,
    enabled: !!walletPubkey,
  })

  return { data, isLoading }
}
