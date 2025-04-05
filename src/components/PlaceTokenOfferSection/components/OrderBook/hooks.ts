import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { useTokenBondOffers, useTokenMarketsPreview } from '@banx/hooks'
import { SyntheticTokenOffer, convertToSynthetic, useSyntheticTokenOffers } from '@banx/store'

const MIN_OFFER_SIZE = 1000

export const useMarketOrders = (
  marketPubkey: string,
  offerPubkey: string,
  lendingToken: LendingTokenType,
) => {
  const { publicKey } = useWallet()

  const { offers, isLoading } = useTokenBondOffers({
    marketPubkey: new web3.PublicKey(marketPubkey),
    lendingTokenType: lendingToken,
    excludeWallet: publicKey || undefined,
  })

  const { marketsPreview } = useTokenMarketsPreview()

  const processedOffers = useProcessedOffers({
    marketPubkey,
    offers,
    editableOfferPubkey: offerPubkey,
  })

  const sortedOffers = useMemo(() => {
    return [...processedOffers].sort((orderA, orderB) => {
      if (orderA.collateralsPerToken === 0) return 1
      if (orderB.collateralsPerToken === 0) return -1
      return orderA.collateralsPerToken - orderB.collateralsPerToken
    })
  }, [processedOffers])

  const bestOffer = useMemo(() => {
    const [firstOffer, secondOffer] = sortedOffers
    const isFirstOfferEditable =
      firstOffer?.publicKey.toBase58() === PUBKEY_PLACEHOLDER || firstOffer?.isEdit
    return isFirstOfferEditable ? secondOffer : firstOffer
  }, [sortedOffers])

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  return {
    offers: sortedOffers,
    isLoading,
    bestOffer,
    market,
  }
}

type UseProcessedOffers = (props: {
  offers: BondOfferV3[]
  marketPubkey: string
  editableOfferPubkey: string
}) => SyntheticTokenOffer[]

const useProcessedOffers: UseProcessedOffers = ({ marketPubkey, offers, editableOfferPubkey }) => {
  const { offerByMarketPubkey } = useSyntheticTokenOffers()
  const { publicKey } = useWallet()

  const processedOffers = useMemo(() => {
    const syntheticOffer = offerByMarketPubkey[marketPubkey]

    if (!offers) return []

    const offersConvertedToSynthetic = offers.map((offer) => convertToSynthetic(offer))

    const processedEditableOffers = offersConvertedToSynthetic
      .filter((offer) => offer.publicKey.toBase58() !== editableOfferPubkey)
      //? Filter out offers with a size smaller than the minimum threshold
      .filter((offer) => offer.offerSize > MIN_OFFER_SIZE)
      //? Filter empty offers, but always show user offers
      .filter((offer) => !(offer.offerSize === 0 && offer.assetReceiver !== publicKey?.toBase58()))

    if (syntheticOffer) {
      processedEditableOffers.push(syntheticOffer)
    }

    return processedEditableOffers
  }, [offerByMarketPubkey, marketPubkey, offers, editableOfferPubkey, publicKey])

  return processedOffers
}
