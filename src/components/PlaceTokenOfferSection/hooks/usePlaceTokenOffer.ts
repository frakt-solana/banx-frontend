import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty } from 'lodash'

import { useTokenBondOffers, useTokenMarketsPreview } from '@banx/hooks'
import { createEmptySyntheticTokenOffer, useSyntheticTokenOffers } from '@banx/store'
import { getTokenDecimals } from '@banx/utils'

import { FIELD_CONFIG, useFormStateChecks, useOfferFormController } from './useOfferFormController'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

interface PlaceTokenOfferProps {
  marketPubkey: string
  offerPubkey: string
  lendingToken: LendingTokenType
}

export const usePlaceTokenOffer = ({
  marketPubkey,
  offerPubkey,
  lendingToken,
}: PlaceTokenOfferProps) => {
  const { syntheticOffer, setSyntheticOffer } = useSyntheticOffer(offerPubkey, marketPubkey)
  const { offer, market, updateOrAddOffer } = useMarketAndOfferData({
    offerPubkey,
    marketPubkey,
    lendingToken,
  })

  const isEditMode = Boolean(offerPubkey)
  const isOracleMarket = market?.oraclePriceFeedType !== 'none'

  const { formState, initialValues, numericValues, generateField, resetForm } =
    useOfferFormController({
      syntheticOffer,
      market,
      lendingToken,
    })

  const collateralsPerToken = useMemo(() => {
    if (!market) return 0

    const collataralDecimals = market.collateral.decimals || 0
    return calculateCollateralPerToken(numericValues.tokensPerCollateral, collataralDecimals)
  }, [market, numericValues.tokensPerCollateral])

  useEffect(() => {
    if (!syntheticOffer || isEmpty(numericValues)) return
    const { apr, offerSize, offerLiquidationLtv, offerLtv } = numericValues

    const lendingTokenDecimals = getTokenDecimals(lendingToken)

    const newSyntheticOffer = {
      ...syntheticOffer,
      apr,
      offerLtv: offerLtv,
      liquidationLtv: offerLiquidationLtv,
      collateralsPerToken: collateralsPerToken,
      offerSize: offerSize * 10 ** lendingTokenDecimals,
    }
    setSyntheticOffer(newSyntheticOffer)
  }, [syntheticOffer, setSyntheticOffer, numericValues, collateralsPerToken, lendingToken])

  const { createOffer, updateOffer, removeOffer } = useTokenOfferTransactions({
    offer,
    marketPubkey,
    apr: numericValues.apr,
    loanValue: numericValues.offerSize,
    liquidationLtv: numericValues.offerLiquidationLtv,
    offerLtv: numericValues.offerLtv,
    collateralsPerToken,
    lendingToken,
    updateOrAddOffer,
    resetForm,
  })

  const activeFieldConfig = isOracleMarket ? FIELD_CONFIG.oracle : FIELD_CONFIG.nonOracle
  const { disablePlaceOffer, disableUpdateOffer, errorMessage } = useFormStateChecks({
    formState,
    initialValues,
    fieldConfig: activeFieldConfig,
  })

  return {
    market,
    isEditMode,
    isOracleMarket,

    values: {
      apr: numericValues.apr,
      offerSize: numericValues.offerSize,
      tokensPerCollateral: numericValues.tokensPerCollateral,
      collateralsPerToken,
    },

    fields: {
      apr: generateField('apr'),
      offerSize: generateField('offerSize'),
      tokensPerCollateral: generateField('tokensPerCollateral'),
      offerLiquidationLtv: generateField('offerLiquidationLtv'),
      offerLtv: generateField('offerLtv'),
    },

    validation: {
      disablePlaceOffer,
      disableUpdateOffer,
      errorMessage,
    },

    actions: {
      createOffer,
      updateOffer,
      removeOffer,
    },
  }
}

const calculateCollateralPerToken = (tokensPerCollateral: number, decimals: number) => {
  if (!tokensPerCollateral || isNaN(tokensPerCollateral)) {
    return 0
  }

  return (1 / tokensPerCollateral) * Math.pow(10, decimals)
}

const useSyntheticOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticTokenOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findOfferByPubkey(offerPubkey) ||
      createEmptySyntheticTokenOffer({ marketPubkey, walletPubkey })
    )
  }, [findOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const removeSyntheticOffer = () => removeOffer(syntheticOffer.marketPubkey)

  return { syntheticOffer, removeSyntheticOffer, setSyntheticOffer }
}

const useMarketAndOfferData = (props: {
  offerPubkey: string
  marketPubkey: string
  lendingToken: LendingTokenType
}) => {
  const { offerPubkey, marketPubkey, lendingToken } = props
  const { publicKey } = useWallet()

  const { marketsPreview } = useTokenMarketsPreview(lendingToken)

  const { offers, updateOrAddOptimisticOffer } = useTokenBondOffers({
    marketPubkey: new web3.PublicKey(marketPubkey),
    lendingTokenType: lendingToken,
    excludeWallet: publicKey || undefined,
  })

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  const offer = useMemo(() => {
    return offers.find((offer) => offer.publicKey.toBase58() === offerPubkey)
  }, [offers, offerPubkey])

  return { offer, market, updateOrAddOffer: updateOrAddOptimisticOffer }
}
