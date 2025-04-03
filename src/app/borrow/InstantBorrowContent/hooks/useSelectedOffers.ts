import { create } from 'zustand'

import { BorrowOffer } from './useBorrowOffers'

interface SelectedOfferState {
  selectedOffer: BorrowOffer | null
  setSelectedOffer: (offer: BorrowOffer) => void
  getSelectedOffer: () => BorrowOffer | null
  clearSelection: () => void
}

export const useSelectedOffer = create<SelectedOfferState>((set, get) => ({
  selectedOffer: null,
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  getSelectedOffer: () => get().selectedOffer,
  clearSelection: () => set({ selectedOffer: null }),
}))
