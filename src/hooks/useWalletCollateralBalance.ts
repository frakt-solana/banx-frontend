import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'

import { fetchTokenBalance } from '@banx/api/common'
import { ZERO_BN } from '@banx/utils'

export const useWalletCollateralBalance = (tokenMint: web3.PublicKey) => {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const { data, isLoading } = useQuery({
    queryKey: ['walletBalance', tokenMint, publicKey],
    queryFn: () =>
      fetchTokenBalance({
        tokenAddress: tokenMint.toBase58(),
        connection,
        publicKey: publicKey || web3.PublicKey.default,
      }),
    enabled: !!connected,
    refetchOnWindowFocus: false,
    staleTime: 15 * 1000,
  })

  return { walletCollateralBalance: data || ZERO_BN, isLoading }
}
