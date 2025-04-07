import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { TokenMarketPreview, core } from '@banx/api'
import { useTokenMarketsPreview } from '@banx/hooks'
import { isOfferNewer, isOptimisticOfferExpired, useTokenOffersOptimistic } from '@banx/store'
import { isBondOfferV3Closed } from '@banx/utils/core/offers'

export const useOffersPreviewData = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const {
    optimisticOffers,
    remove: removeOffers,
    update: updateOrAddOffer,
  } = useTokenOffersOptimistic()

  const { marketsPreview, isLoading: isLoadingMarkets } = useTokenMarketsPreview()

  const {
    data,
    isLoading: isLoadingOffersPreview,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ['tokenOffersPreview', walletPubkey],
    queryFn: () => core.fetchUserOffersPreview({ walletPubkey }),
    refetchOnWindowFocus: false,
    refetchInterval: 30 * 1000,
    staleTime: 30 * 1000,
  })

  useEffect(() => {
    if (!data) return

    const userOffers = data.map(({ bondOffer }) => bondOffer)

    if (!userOffers || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = _.chain(optimisticOffers)
      .filter(({ offer }) => !isBondOfferV3Closed(offer))
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(
          ({ publicKey }) => publicKey?.toBase58() === offer.publicKey.toBase58(),
        )
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        _.map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) =>
          offer.publicKey?.toBase58(),
        ),
      )
    }
  }, [data, isFetching, isFetched, optimisticOffers, removeOffers])

  const offersPreview = useMemo(() => {
    if (!data || !marketsPreview.length) return []

    const userOffers = data.map((offer) => offer)

    const optimisticUserOffers = optimisticOffers
      .map(({ offer }) => {
        const tokenMarketPreview = marketsPreview.find(
          ({ marketPubkey }) => marketPubkey === offer.hadoMarket?.toBase58(),
        ) as TokenMarketPreview

        return createSynteticBondOfferV3Preview(offer, tokenMarketPreview)
      })
      .filter(({ bondOffer }) => bondOffer.assetReceiver.toBase58() === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return _.chain(combinedOffers)
      .groupBy(({ bondOffer }) => bondOffer.publicKey.toBase58())
      .map((groupedOffers) =>
        _.maxBy(groupedOffers, ({ bondOffer }) => bondOffer.lastTransactedAt.toNumber()),
      )
      .compact()
      .filter(({ bondOffer }) => !isBondOfferV3Closed(bondOffer))
      .value()
  }, [marketsPreview, data, optimisticOffers, publicKey])

  return {
    offersPreview,
    isLoading: isLoadingMarkets || isLoadingOffersPreview,
    updateOrAddOffer,
  }
}

const createSynteticBondOfferV3Preview = (
  offer: BondOfferV3,
  tokenMarketPreview: TokenMarketPreview,
) => {
  const offerSize = offer.fundsSolOrTokenBalance.add(offer.bidSettlement).toNumber()

  return {
    publicKey: offer.publicKey?.toBase58(),
    bondOffer: offer,
    tokenMarketPreview,
    tokenOfferPreview: {
      publicKey: offer.publicKey?.toBase58(),
      liquidatedLoansAmount: 0,
      terminatingLoansAmount: 0,
      repaymentCallsAmount: 0,
      accruedInterest: 0,
      inLoans: 0,
      offerSize,
    },
  }
}
