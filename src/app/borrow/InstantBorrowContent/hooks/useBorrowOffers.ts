import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { BorrowOfferRaw, CollateralToken, core } from '@banx/api'
import { useTokenType } from '@banx/store/common'
import { ZERO_BN, getTokenDecimals } from '@banx/utils'

import { BorrowToken } from '../../constants'
import { MIN_OFFER_SIZE } from '../constants'
import { useBorrowStore } from './useBorrowStore'

export interface BorrowOffer extends BorrowOfferRaw {
  maxLtv: number
  maxBorrow: BN
}

export const useBorrowOffers = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() ?? ''

  const { borrowToken, collateral, ltvSliderValue } = useBorrowStore()

  const { suggestedOffers, allOffers, isLoading } = useFetchOffers({
    customLtv: ltvSliderValue,
    borrowToken,
    collateral,
  })

  const { tokenType } = useTokenType()
  const tokenDecimals = getTokenDecimals(tokenType)

  const mergedOffers = useMemo(() => {
    if (!suggestedOffers && !allOffers) return []

    const enhanceOffer = (offer: BorrowOfferRaw): BorrowOffer => {
      const matchingSuggestedOffer = _.find(suggestedOffers, { publicKey: offer.publicKey })

      const maxCollateralAvailable = new BN(offer.maxCollateralToReceive)
      const collateralInWallet = collateral?.amountInWallet || ZERO_BN
      const usableCollateral = BN.min(maxCollateralAvailable, collateralInWallet)

      const maxBorrowableAmount = usableCollateral
        .mul(new BN(10 ** tokenDecimals))
        .divRound(new BN(offer.collateralsPerToken))

      return {
        ...(matchingSuggestedOffer ?? offer),
        maxLtv: parseFloat(offer.ltv),
        maxBorrow: maxBorrowableAmount,
      }
    }

    return (
      _.chain(allOffers)
        .map(enhanceOffer)
        //? Filter out offers with a size smaller than the minimum threshold
        .filter((offer) => new BN(offer.maxTokenToGet).gt(new BN(MIN_OFFER_SIZE)))
        .filter((offer) => offer.assetReceiver !== walletPubkey)
        .value()
    )
  }, [allOffers, collateral, suggestedOffers, tokenDecimals, walletPubkey])

  return {
    data: mergedOffers,
    isLoading,
  }
}

const useFetchOffers = (props: {
  collateral: CollateralToken | undefined
  borrowToken: BorrowToken | undefined
  customLtv: number
}) => {
  const { borrowToken, collateral, customLtv } = props

  const queryParams = {
    market: collateral?.marketPubkey ?? '',
    bondingCurveType: getBondingCurveTypeFromLendingToken(
      borrowToken?.lendingTokenType ?? LendingTokenType.Usdc,
    ),
    excludeWallet: PUBKEY_PLACEHOLDER,
  }

  const fetchOffers = (customLtv?: number) => core.fetchBorrowOffers({ ...queryParams, customLtv })

  const allOffersQuery = useQuery({
    queryKey: ['allBorrowOffers', collateral],
    queryFn: () => fetchOffers(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(collateral && borrowToken),
  })

  const suggestedOffersQuery = useQuery({
    queryKey: ['suggestedBorrowOffers', collateral, borrowToken?.lendingTokenType, customLtv],
    queryFn: () => fetchOffers(customLtv * 100),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(customLtv && collateral && borrowToken),
  })

  const isInitialLoading = allOffersQuery.isLoading && suggestedOffersQuery.isLoading
  const isDataLoading = allOffersQuery.isFetching || suggestedOffersQuery.isFetching

  const isLoading = isInitialLoading || isDataLoading

  return {
    suggestedOffers: suggestedOffersQuery.data,
    allOffers: allOffersQuery.data,
    isLoading,
  }
}
