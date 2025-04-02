'use client'

import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store'
import { ZERO_BN } from '@banx/utils'

export const useWalletTokenAssets = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { tokenType: marketType } = useTokenType()

  const { data, isLoading } = useQuery({
    queryKey: ['walletTokenAssets', walletPubkey, marketType],
    queryFn: () => core.fetchCollateralsList({ walletPubkey, marketType }),
    refetchOnWindowFocus: false,
    refetchInterval: 10_000,
    staleTime: 10_000,
  })

  const tokens = useMemo(() => {
    if (!data) return []
    return data
      .filter((token) => token.amountInWallet.gt(ZERO_BN))
      .sort((a, b) => b.amountInWallet.cmp(a.amountInWallet))
  }, [data])

  return { tokens, isLoading }
}
