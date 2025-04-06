import produce from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api'

type LoansTokenState = {
  selection: Loan[]
  set: (loans: Loan[]) => void
  find: (loanPubkey: string) => Loan | null
  add: (nft: Loan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: Loan) => void
  clear: () => void
}

export const useMarketLoansState = create<LoansTokenState>((set, get) => ({
  selection: [],

  set: (loans) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection = loans.map((loan) => loan)
      }),
    )
  },

  find: (loanPubkey) => {
    return get().selection.find(({ publicKey }) => publicKey === loanPubkey) ?? null
  },

  add: (loan) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection.push(loan)
      }),
    )
  },

  remove: (loanPubkey) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection = state.selection.filter(({ publicKey }) => publicKey !== loanPubkey)
      }),
    )
  },

  clear: () => {
    set(
      produce((state: LoansTokenState) => {
        state.selection = []
      }),
    )
  },

  toggle: (loan) => {
    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey)

    return isLoanInSelection ? remove(loan.publicKey) : add(loan)
  },
}))
