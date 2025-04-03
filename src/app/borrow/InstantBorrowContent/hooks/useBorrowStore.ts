import { create } from 'zustand'

import { CollateralToken } from '@banx/api/tokens'

import { BorrowToken } from '../../constants'

interface BorrowStoreState {
  borrowToken: BorrowToken | undefined
  borrowInputValue: string

  collateral: CollateralToken | undefined
  collateralInputValue: string

  ltvSliderValue: number

  setBorrowToken: (token: BorrowToken) => void
  setBorrowInputValue: (value: string) => void

  setCollateral: (token: CollateralToken | undefined) => void
  setCollateralInputValue: (value: string) => void

  setLtvSlider: (value: number) => void
}

export const useBorrowStore = create<BorrowStoreState>((set) => ({
  borrowToken: undefined,
  borrowInputValue: '',

  collateral: undefined,
  collateralInputValue: '',

  ltvSliderValue: 0,

  setBorrowToken: (token) => set({ borrowToken: token }),
  setBorrowInputValue: (value) => set({ borrowInputValue: value }),

  setCollateral: (token) => set({ collateral: token, ltvSliderValue: 0 }),
  setCollateralInputValue: (value) => set({ collateralInputValue: value }),

  setLtvSlider: (value) => set({ ltvSliderValue: value }),
}))
