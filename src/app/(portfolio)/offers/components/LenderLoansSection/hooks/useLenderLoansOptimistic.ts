import { useMemo } from 'react'

import { produce } from 'immer'
import _ from 'lodash'
import { create } from 'zustand'

import { Loan } from '@banx/api'
import { useTokenType } from '@banx/store/common'

export interface LoanOptimistic {
  loan: Loan
  wallet: string
}

interface TokenLenderLoansOptimisticState {
  loans: LoanOptimistic[]
  addLoans: (loan: Loan, walletPublicKey: string) => void
  findLoan: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  updateLoans: (loan: Loan, walletPublicKey: string) => void
}

const useLenderTokenLoansOptimisticState = create<TokenLenderLoansOptimisticState>((set, get) => ({
  loans: [],
  addLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: TokenLenderLoansOptimisticState) => {
        state.loans.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  findLoan: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().loans.find(({ loan }) => loan.publicKey === loanPubkey) ?? null
  },
  updateLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const loanExists = !!get().findLoan(loan.publicKey, walletPublicKey)

    return (
      loanExists &&
      set(
        produce((state: TokenLenderLoansOptimisticState) => {
          state.loans = state.loans.map((existingLoan) =>
            existingLoan.loan.publicKey === loan.publicKey
              ? convertLoanToOptimistic(loan, walletPublicKey)
              : existingLoan,
          )
        }),
      )
    )
  },
}))

export const useLenderLoansOptimistic = () => {
  const { loans, addLoans, findLoan, updateLoans } = useLenderTokenLoansOptimisticState()

  const { tokenType } = useTokenType()

  //? As zustand stores loans until user refreshes the page, we need to filter optimistics by tokenType
  //? To prevent loans duplication on tokenType switching
  const loansFilteredByTokenType = useMemo(() => {
    return _.filter(loans, ({ loan }) => loan.bondTradeTransaction.lendingToken === tokenType)
  }, [loans, tokenType])

  return {
    loans: loansFilteredByTokenType,
    addLoans,
    findLoan,
    updateLoans,
  }
}

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}
