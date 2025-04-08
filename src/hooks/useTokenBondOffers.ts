import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { BondOfferV3, LendingTokenType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { core } from '@banx/api'
import { isOfferNewer, isOptimisticOfferExpired, useTokenOffersOptimistic } from '@banx/store'
import { isOfferStateClosed } from '@banx/utils/core'

type UseTokenBondOffersProps = {
  marketPubkey: web3.PublicKey | undefined
  excludeWallet?: web3.PublicKey
  lendingTokenType: LendingTokenType
}

export const useTokenBondOffers = ({
  marketPubkey,
  lendingTokenType,
  excludeWallet,
}: UseTokenBondOffersProps) => {
  const { optimisticOffers, update: updateOffer, remove: removeOffers } = useTokenOffersOptimistic()

  const { data, isLoading, isFetching, isFetched } = useQuery({
    queryKey: ['tokenBondOffers', marketPubkey, lendingTokenType, excludeWallet],
    queryFn: () =>
      core.fetchMarketOffers({
        marketPubkey: marketPubkey?.toBase58(),
        tokenType: lendingTokenType,
        excludeWallet: excludeWallet?.toBase58(),
      }),
    enabled: !!marketPubkey,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = _.chain(optimisticOffers)
      .filter(({ offer }) => !isOfferStateClosed(offer?.pairState))
      .filter(({ offer }) => {
        const sameOfferFromBE = data?.find(
          ({ publicKey }) => publicKey.toBase58() === offer.publicKey.toBase58(),
        )
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        _.map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) =>
          offer.publicKey.toBase58(),
        ),
      )
    }
  }, [data, isFetched, isFetching, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    const filteredOptimisticOffers = optimisticOffers
      .filter(({ offer }) => offer.hadoMarket?.toBase58() === marketPubkey?.toBase58())
      .map(({ offer }) => offer)

    const combinedOffers = [...filteredOptimisticOffers, ...(data ?? [])]

    return _.chain(combinedOffers)
      .groupBy((offer) => offer.publicKey.toBase58())
      .map((offers) => _.maxBy(offers, (offer) => offer.lastTransactedAt.toNumber()))
      .filter((offer) => !isOfferStateClosed(offer?.pairState || PairState.PerpetualClosed))
      .compact()
      .value()
  }, [optimisticOffers, data, marketPubkey])

  const updateOrAddOptimisticOffer = (offer: BondOfferV3) => {
    updateOffer([offer])
  }

  return { offers, updateOrAddOptimisticOffer, isLoading }
}
