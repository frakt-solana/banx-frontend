import { BN, web3 } from 'fbonds-core'
import {
  BondFeatures,
  BondOfferV3,
  BondingCurveType,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { convertValuesInAccount } from 'solana-transactions-parser'
import { z } from 'zod'

import { zNumberToBN, zStringToPubkey } from '@banx/api/zodSchemas'
import { bnToNumberSafe } from '@banx/utils/bn'

import { Offer, OfferApi } from './types'

export const convertBondOfferV3ToCore = (bondOffer: BondOfferV3): Offer => {
  return convertValuesInAccount<Offer>(bondOffer, {
    bnParser: (v) => {
      return bnToNumberSafe(v)
    },
    pubkeyParser: (v) => v.toBase58(),
  })
}

export const convertCoreOfferToBondOfferV3 = (offer: Offer): BondOfferV3 => {
  return z
    .object({
      publicKey: zStringToPubkey,
      assetReceiver: zStringToPubkey,
      baseSpotPrice: zNumberToBN,
      bidCap: zNumberToBN,
      bidSettlement: zNumberToBN,
      bondingCurve: z.object({
        delta: zNumberToBN,
        bondingType: z.nativeEnum(BondingCurveType),
      }),
      buyOrdersQuantity: zNumberToBN,
      concentrationIndex: zNumberToBN,
      currentSpotPrice: zNumberToBN,
      edgeSettlement: zNumberToBN,
      fundsSolOrTokenBalance: zNumberToBN,
      hadoMarket: zStringToPubkey,
      lastTransactedAt: zNumberToBN,
      mathCounter: zNumberToBN,
      pairState: z.nativeEnum(PairState),
      validation: z.object({
        loanToValueFilter: zNumberToBN,
        collateralsPerToken: zNumberToBN,
        maxReturnAmountFilter: zNumberToBN,
        bondFeatures: z.nativeEnum(BondFeatures),
      }),

      loanApr: zNumberToBN,
      liquidationLtvBp: zNumberToBN,
      offerLtvBp: zNumberToBN,
    })
    .parse(offer)
}

export const convertBondOfferV3ToOfferApi = (offer: BondOfferV3): OfferApi => {
  return {
    publicKey: offer.publicKey.toBase58(),
    assetReceiver: offer.assetReceiver.toBase58(),
    baseSpotPrice: offer.baseSpotPrice.toString(),
    bidCap: offer.bidCap.toString(),
    bidSettlement: offer.bidSettlement.toString(),
    bondingCurve: {
      delta: offer.bondingCurve.delta.toString(),
      bondingType: offer.bondingCurve.bondingType,
    },
    buyOrdersQuantity: offer.buyOrdersQuantity.toString(),
    concentrationIndex: offer.concentrationIndex.toString(),
    currentSpotPrice: offer.currentSpotPrice.toString(),
    edgeSettlement: offer.edgeSettlement.toString(),
    fundsSolOrTokenBalance: offer.fundsSolOrTokenBalance.toString(),
    lastTransactedAt: offer.lastTransactedAt.toString(),
    mathCounter: offer.mathCounter.toString(),
    pairState: offer.pairState,
    hadoMarket: offer.hadoMarket?.toBase58(),

    validation: {
      loanToValueFilter: offer.validation.loanToValueFilter.toString(),
      collateralsPerToken: offer.validation.collateralsPerToken.toString(),
      maxReturnAmountFilter: offer.validation.maxReturnAmountFilter.toString(),
      bondFeatures: offer.validation.bondFeatures,
    },

    loanApr: offer.loanApr.toString(),
    liquidationLtvBp: offer.liquidationLtvBp.toString(),
    offerLtvBp: offer.offerLtvBp.toString(),
  }
}

export const convertOfferApiToBondOfferV3 = (offer: OfferApi): BondOfferV3 => {
  return {
    publicKey: new web3.PublicKey(offer.publicKey),
    assetReceiver: new web3.PublicKey(offer.assetReceiver),
    baseSpotPrice: new BN(offer.baseSpotPrice),
    bidCap: new BN(offer.bidCap),
    bidSettlement: new BN(offer.bidSettlement),
    bondingCurve: {
      delta: new BN(offer.bondingCurve.delta),
      bondingType: offer.bondingCurve.bondingType,
    },
    buyOrdersQuantity: new BN(offer.buyOrdersQuantity),
    concentrationIndex: new BN(offer.concentrationIndex),
    currentSpotPrice: new BN(offer.currentSpotPrice),
    edgeSettlement: new BN(offer.edgeSettlement),
    fundsSolOrTokenBalance: new BN(offer.fundsSolOrTokenBalance),
    lastTransactedAt: new BN(offer.lastTransactedAt),
    mathCounter: new BN(offer.mathCounter),
    pairState: offer.pairState,
    hadoMarket: new web3.PublicKey(offer.hadoMarket),

    validation: {
      loanToValueFilter: new BN(offer.validation.loanToValueFilter),
      collateralsPerToken: new BN(offer.validation.collateralsPerToken),
      maxReturnAmountFilter: new BN(offer.validation.maxReturnAmountFilter),
      bondFeatures: offer.validation.bondFeatures,
    },

    loanApr: new BN(offer.loanApr),
    liquidationLtvBp: new BN(offer.liquidationLtvBp),
    offerLtvBp: new BN(offer.offerLtvBp),
  }
}
