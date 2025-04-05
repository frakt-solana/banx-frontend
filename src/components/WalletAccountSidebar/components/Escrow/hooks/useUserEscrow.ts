import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { UserEscrow, fetchUserEscrows } from '@banx/api'
import { useClusterStats } from '@banx/hooks'
import { queryClient } from '@banx/providers/query'
import { useTokenType } from '@banx/store'

import { getUserEscrowInfo } from '../helpers'

const USE_USER_ESCROW_QUERY_KEY = 'userEscrow'
const createUserEscrowQueryKey = (walletPubkey: string) => [USE_USER_ESCROW_QUERY_KEY, walletPubkey]

export const useUserEscrow = () => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data: userEscrows, isLoading } = useQuery({
    queryKey: createUserEscrowQueryKey(walletPublicKey),
    queryFn: () => fetchUserEscrows({ walletPublicKey }),
    enabled: !!publicKey,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const userEscrow: UserEscrow | undefined = userEscrows?.find(
    (escrow) => escrow.lendingTokenType === tokenType,
  )

  return {
    userEscrow,
    isLoading,
    updateUserEscrowOptimistic,
  }
}

type UpdateUserEscrowOptions = {
  walletPubkey: string
  updatedUserEscrow: UserEscrow
}

const updateUserEscrowOptimistic = ({
  walletPubkey,
  updatedUserEscrow,
}: UpdateUserEscrowOptions) => {
  queryClient.setQueryData(
    createUserEscrowQueryKey(walletPubkey),
    (queryData: UserEscrow[] | undefined) => {
      if (!queryData) return queryData

      const updatedEscrows = queryData.map((escrow) =>
        escrow.publicKey.toBase58() === updatedUserEscrow.publicKey.toBase58()
          ? { ...escrow, ...updatedUserEscrow }
          : escrow,
      )
      return updatedEscrows
    },
  )
}

export const useUserEscrowInfo = () => {
  const { userEscrow, updateUserEscrowOptimistic } = useUserEscrow()
  const { data: clusterStats } = useClusterStats()

  const userEscrowInfo = getUserEscrowInfo({ userEscrow, clusterStats })

  return {
    userEscrow,
    userEscrowInfo,
    updateUserEscrowOptimistic,
    clusterStats,
  }
}
