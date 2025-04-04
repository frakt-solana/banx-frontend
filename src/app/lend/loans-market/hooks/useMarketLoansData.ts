import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'

interface HiddenLoansPubkeysState {
  pubkeys: string[]
  addLoansPubkeys: (pubkeys: string[]) => void
}

const useHiddenLoansPubkeys = create<HiddenLoansPubkeysState>((set) => ({
  pubkeys: [],
  addLoansPubkeys: (pubkeys) => {
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.pubkeys = pubkeys.map((pubkey) => pubkey)
      }),
    )
  },
}))

export const useMarketLoansData = () => {
  const { pubkeys, addLoansPubkeys } = useHiddenLoansPubkeys()
  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery({
    queryKey: ['allTokenLoanAuctionsAndListings', tokenType],
    queryFn: () => core.fetchTokenLoanAuctionsAndListings({ tokenType }),
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000,
    staleTime: 60 * 1000,
  })

  const loans = useMemo(() => {
    if (!data) return []

    const combinedLoans = [...data.auctions, ...data.listings]
    return combinedLoans.filter((loan) => !pubkeys.includes(loan.publicKey))
  }, [data, pubkeys])

  return {
    loans,
    isLoading,
    addLoansPubkeys,
  }
}
