import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'

import { fetchTokenBalance } from '@banx/api/common'
import { WSOL_ADDRESS } from '@banx/constants'
import { ZERO_BN } from '@banx/utils'

import { BORROW_TOKENS_LIST } from './constants'

export const useBorrowTokensList = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const fetchSolBalance = async () => {
    if (!publicKey) return ZERO_BN

    const accountInfo = await connection.getAccountInfo(publicKey)
    return new BN(accountInfo?.lamports || 0)
  }

  const fetchTokenBalanceByMint = async (mintAddress: string) => {
    if (!publicKey) return ZERO_BN

    const balanceBN = await fetchTokenBalance({
      tokenAddress: mintAddress,
      connection,
      publicKey,
    })

    return balanceBN
  }

  const fetchBorrowTokenList = async () => {
    if (!connection || !publicKey) return BORROW_TOKENS_LIST

    return await Promise.all(
      BORROW_TOKENS_LIST.map(async (token) => {
        const isSolToken = token.collateral.mint === WSOL_ADDRESS

        const amountInWallet = isSolToken
          ? await fetchSolBalance()
          : await fetchTokenBalanceByMint(token.collateral.mint)

        return { ...token, amountInWallet }
      }),
    )
  }
  const { data, isLoading } = useQuery({
    queryKey: ['borrowTokensList', publicKey],
    queryFn: fetchBorrowTokenList,
    refetchInterval: false,
    staleTime: 15_000,
  })

  return { borrowTokensList: data ?? [], isLoading }
}
