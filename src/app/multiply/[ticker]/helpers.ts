import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, SECONDS_IN_YEAR } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  calcMaxMultiplier,
  offer as tokenOfferUtils,
} from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import moment from 'moment'

import { OnboardingModalContentType } from '@banx/components/modals'

import { TokenMeta } from '@banx/api/tokens'
import { leverage } from '@banx/transactions/leverage'
import { ZERO_BN, bnToNumberSafe, getTokenDecimals } from '@banx/utils'

import { MIN_MULTIPLIER_VALUE, QUOTE_PARAMS_CONFIG_MAP } from './constants'
import { LeverageSimpleOffer, MultiplyPair } from './types'

export const calculateTokenLoanBorrowAmount = (
  flashLoanCollateralAmount: BN,
  conversionRate: number,
  tokenDecimals: number,
  collateralDecimals: number,
) => {
  if (conversionRate === 0) {
    return ZERO_BN
  }

  return flashLoanCollateralAmount
    .mul(new BN(10 ** tokenDecimals))
    .div(new BN(conversionRate * 10 ** collateralDecimals))
}

type CalculateNetAprParams = {
  totalCollateralAmount: BN
  userEnteredCollateralAmount: BN
  conversionRate: number
  collateralYield: BN
  aprRate: number
  tokenDecimals: number
  collateralDecimals: number
}
export const calculateNetApr = ({
  totalCollateralAmount,
  userEnteredCollateralAmount,
  conversionRate,
  collateralYield,
  aprRate,
  tokenDecimals,
  collateralDecimals,
}: CalculateNetAprParams) => {
  if (conversionRate === 0) {
    return 0
  }

  const totalBorrowAmount = calculateTokenLoanBorrowAmount(
    totalCollateralAmount.sub(userEnteredCollateralAmount),
    conversionRate,
    tokenDecimals,
    collateralDecimals,
  )

  const debtInYear = calculateCurrentInterestSolPure({
    loanValue: bnToNumberSafe(totalBorrowAmount),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_YEAR,
    rateBasePoints: aprRate,
  })

  const totalCollateralInToken = totalCollateralAmount
    .mul(new BN(10 ** tokenDecimals))
    .div(new BN(conversionRate * 10 ** collateralDecimals))

  //? Result can be decimal --> use number instead of BN
  const collateralYieldPerYearInToken: number =
    (bnToNumberSafe(totalCollateralInToken) * collateralYield.toNumber()) / BASE_POINTS

  const yieldAndDebtDiff = collateralYieldPerYearInToken - debtInYear

  const userEnteredCollateralAmountInToken = userEnteredCollateralAmount
    .mul(new BN(10 ** tokenDecimals))
    .div(new BN(conversionRate * 10 ** collateralDecimals))

  const netApr = (yieldAndDebtDiff / bnToNumberSafe(userEnteredCollateralAmountInToken)) * 100

  return netApr || 0
}

export const createMultiplyPairFromCollateral = (
  collateralTokenMeta: TokenMeta,
  marketPubkey: string,
  marketTokenType: LendingTokenType,
) => {
  const customQuoteParamsConfig =
    QUOTE_PARAMS_CONFIG_MAP[marketTokenType]?.[collateralTokenMeta.mint]

  const pair: MultiplyPair = {
    collateralTicker: collateralTokenMeta.ticker,
    collateralLogoUrl: collateralTokenMeta.logoUrl,
    collateralMint: new web3.PublicKey(collateralTokenMeta.mint),
    marketTokenType: marketTokenType,
    marketPublicKey: new web3.PublicKey(marketPubkey),
    loanValueLimit: undefined,
    createLeverageTxnHandler: leverage.createLeverageTxnData,
    createSellToRepayTxnHandler: leverage.createSellToRepayTokenLoanTxnData,
    onboardingContent: OnboardingModalContentType.MULTIPLY,
    ...customQuoteParamsConfig,
  }

  return pair
}

export const collateralPriceFromConversionRate = (
  conversionRate: number,
  lendingTokenType: LendingTokenType,
) => {
  const lendingTokenDecimals = getTokenDecimals(lendingTokenType)
  return (1 / conversionRate) * 10 ** lendingTokenDecimals
}

type CreateLeverageSimpleOffers = (params: {
  offers: BondOfferV3[]
  lendingTokenType: LendingTokenType
  collateralDecimals: number
  collateralConversionRate: number
  minCollateralToReceiveFilter?: BN
}) => LeverageSimpleOffer[]
export const createLeverageSimpleOffers: CreateLeverageSimpleOffers = ({
  offers,
  lendingTokenType,
  collateralDecimals,
  collateralConversionRate,
  minCollateralToReceiveFilter,
}) => {
  return _.chain(offers)
    .map((offer) => {
      return tokenOfferUtils.convertToSimpleOfferV2(offer)
    })
    .compact()
    .map((offer) => {
      const maxCollateralToReceive = tokenOfferUtils.calcMaxCollateralToReceive({
        maxTokenToGet: offer.maxTokenToGet,
        collateralsPerToken: offer.collateralsPerToken,
        tokenDecimals: getTokenDecimals(lendingTokenType),
      })

      const maxMultiplier = calcMaxMultiplier({
        offer: offer,
        maxCollateralToReceive,
        tokenPriceInCollateral: collateralConversionRate,
        collateralDecimals: collateralDecimals,
        tokenDecimals: getTokenDecimals(lendingTokenType),
      })

      return {
        ...offer,
        maxMultiplier,
        maxCollateralToReceive,
      }
    })
    .filter(({ maxCollateralToReceive }) => {
      if (!minCollateralToReceiveFilter) return true
      return maxCollateralToReceive.gte(minCollateralToReceiveFilter)
    })
    .filter(({ maxMultiplier }) => maxMultiplier >= MIN_MULTIPLIER_VALUE)
    .value()
}

export const calcPositionLiquidationPrice = (
  collateralPrice: number,
  ltv: number,
  liquidationLtv: number,
) => {
  return collateralPrice * (ltv / liquidationLtv)
}
