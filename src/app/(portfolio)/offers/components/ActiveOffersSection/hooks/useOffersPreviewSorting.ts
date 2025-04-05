import { useMemo, useState } from 'react'

import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { OfferPreview } from '@banx/api'
import { WSOL_ADDRESS } from '@banx/constants'
import { useTokenPrice } from '@banx/hooks'
import {
  bnToNumberSafe,
  calcOfferLtvPercent,
  formatTokensPerCollateral,
  getLendingTokenFromBondingCurve,
  getTokenDecimals,
  isUsdcTokenType,
} from '@banx/utils'

export enum SortField {
  IN_LOANS = 'inLoans',
  IN_OFFERS = 'inOffers',
  LTV = 'ltv',
  APR = 'apr',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'In loans', value: [SortField.IN_LOANS, 'desc'] },
  { label: 'Size', value: [SortField.IN_OFFERS, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
]

export const useOffersPreviewSorting = (offers: OfferPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useTokenPrice(WSOL_ADDRESS)

  const sortedOffers = useMemo(() => {
    if (!sortOption || !tokenPrice || isTokenPriceLoading) return offers

    const [field, order] = sortOption.value

    const getSortValue = (offer: OfferPreview) => {
      const { inLoans, offerSize } = offer.tokenOfferPreview

      const lendingToken = getLendingTokenFromBondingCurve(offer.bondOffer.bondingCurve.bondingType)
      const priceMultiplier = isUsdcTokenType(lendingToken) ? 1 : tokenPrice

      const normalize = (value: number) => value / 10 ** getTokenDecimals(lendingToken)

      if (field === SortField.IN_LOANS) return normalize(inLoans) * priceMultiplier
      if (field === SortField.IN_OFFERS) return normalize(offerSize) * priceMultiplier
      if (field === SortField.LTV) return calculateLtv(offer)
      if (field === SortField.APR) return offer.bondOffer.loanApr.toNumber()

      return 0
    }

    return orderBy(offers, getSortValue, order)
  }, [sortOption, isTokenPriceLoading, offers, tokenPrice])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedOffers,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}

const calculateLtv = (offer: OfferPreview): number => {
  const { collateral, collateralPrice } = offer.tokenMarketPreview

  if (!offer.bondOffer.offerLtvBp.isZero()) {
    return bnToNumberSafe(offer.bondOffer.offerLtvBp) / 100
  }

  const lendingToken = getLendingTokenFromBondingCurve(offer.bondOffer.bondingCurve.bondingType)
  const lendingTokenDecimals = getTokenDecimals(lendingToken)

  const tokensPerCollateral = formatTokensPerCollateral(
    calculateTokensPerCollateralFloat(
      bnToNumberSafe(offer.bondOffer.validation.collateralsPerToken),
      collateral.decimals,
      lendingTokenDecimals,
    ),
    lendingTokenDecimals,
  )

  return calcOfferLtvPercent({
    tokensPerCollateral: parseFloat(tokensPerCollateral),
    lendingTokenDecimals,
    collateralPrice,
  })
}
