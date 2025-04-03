import { web3 } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import produce from 'immer'
import { create } from 'zustand'

import { convertBondOfferV3ToCore } from '@banx/api'
import { bnToNumberSafe, calculateOfferSize } from '@banx/utils'

export interface SyntheticTokenOffer {
  isEdit: boolean //? if offer exits on blochain and in edit mode
  publicKey: web3.PublicKey //? PUBKEY_PLACEHOLDER for offers to create

  marketPubkey: string
  assetReceiver: string

  apr: number
  offerSize: number
  collateralsPerToken: number
  liquidationLtv: number
  offerLtv: number
}

interface SyntheticTokenOffersState {
  offerByMarketPubkey: Record<string, SyntheticTokenOffer>
  findOffer: (marketPubkey: string) => SyntheticTokenOffer | undefined
  findOfferByPubkey: (offerPubkey: string) => SyntheticTokenOffer | undefined
  setOffer: (offer: SyntheticTokenOffer) => void
  removeOffer: (marketPubkey: string) => void
}

export const useSyntheticTokenOffers = create<SyntheticTokenOffersState>((set, get) => ({
  offerByMarketPubkey: {},
  findOffer: (marketPubkey) => {
    return get().offerByMarketPubkey[marketPubkey]
  },
  findOfferByPubkey: (offerPubkey) => {
    const { offerByMarketPubkey } = get()
    return Object.values(offerByMarketPubkey).find(
      ({ publicKey }) => publicKey.toBase58() === offerPubkey,
    )
  },
  setOffer: (offer) =>
    set(
      produce((state: SyntheticTokenOffersState) => {
        delete state.offerByMarketPubkey[offer.marketPubkey]
        state.offerByMarketPubkey[offer.marketPubkey] = offer
      }),
    ),
  removeOffer: (marketPubkey) =>
    set(
      produce((state: SyntheticTokenOffersState) => {
        delete state.offerByMarketPubkey[marketPubkey]
      }),
    ),
}))

type CreateEmptySyntheticTokenOffer = (props: {
  marketPubkey: string
  walletPubkey: string
  isEdit?: boolean
}) => SyntheticTokenOffer

export const createEmptySyntheticTokenOffer: CreateEmptySyntheticTokenOffer = ({
  marketPubkey,
  walletPubkey,
  isEdit = false,
}) => ({
  isEdit,
  publicKey: new web3.PublicKey(PUBKEY_PLACEHOLDER),
  assetReceiver: walletPubkey,
  marketPubkey,
  offerSize: 0,
  collateralsPerToken: 0,
  apr: 0,
  liquidationLtv: 0,
  offerLtv: 0,
})

export const convertToSynthetic = (offer: BondOfferV3, isEdit = false): SyntheticTokenOffer => {
  const { publicKey, assetReceiver, hadoMarket, liquidationLtvBp, offerLtvBp } = offer

  const offerSize = calculateOfferSize(convertBondOfferV3ToCore(offer))
  const apr = bnToNumberSafe(offer.loanApr) / 100
  const liquidationLtv = bnToNumberSafe(liquidationLtvBp) / 100
  const offerLtv = bnToNumberSafe(offerLtvBp) / 100

  return {
    isEdit,
    publicKey,
    marketPubkey: hadoMarket.toBase58(),
    assetReceiver: assetReceiver.toBase58(),
    apr,
    offerSize: bnToNumberSafe(offerSize),
    collateralsPerToken: bnToNumberSafe(offer.validation.collateralsPerToken),
    liquidationLtv,
    offerLtv,
  }
}
