import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import produce from 'immer'
import _ from 'lodash'
import { create } from 'zustand'

import { Loan, fetchLenderLoans } from '@banx/api'

import { useLenderLoansOptimistic } from './useLenderLoansOptimistic'

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

export const useLenderLoansData = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { loans: optimisticLoans, addLoans, findLoan, updateLoans } = useLenderLoansOptimistic()
  const { pubkeys: hiddenLoansPubkeys, addLoansPubkeys } = useHiddenLoansPubkeys()

  const { data: loans, isLoading } = useQuery({
    queryKey: ['lenderTokenLoans', walletPubkey],
    queryFn: () => fetchLenderLoans({ walletPublicKey: walletPubkey }),
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  })

  const walletOptimisticLoans = useMemo(() => {
    if (!walletPubkey) return []
    return optimisticLoans.filter(({ wallet }) => wallet === walletPubkey)
  }, [optimisticLoans, walletPubkey])

  const mergedLoans = useMemo(() => {
    if (isLoading || !loans) {
      return []
    }

    return _.chain(loans)
      .concat(walletOptimisticLoans.map(({ loan }) => loan))
      .groupBy((loan) => loan.publicKey)
      .map((loans) => _.maxBy(loans, (loan) => loan.fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => !hiddenLoansPubkeys.includes(loan.publicKey))
      .value()
  }, [loans, isLoading, walletOptimisticLoans, hiddenLoansPubkeys])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!findLoan(loan.publicKey, walletPubkey)
    return loanExists ? updateLoans(loan, walletPubkey) : addLoans(loan, walletPubkey)
  }

  return {
    loans: mergedLoans,
    isLoading,
    updateOrAddLoan,
    addLoansPubkeys,
  }
}
