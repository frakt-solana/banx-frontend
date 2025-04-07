import { BN } from 'fbonds-core'
import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api'
import { convertToDecimalString, formatTrailingZeros } from '@banx/utils'
import { ZERO_BN } from '@banx/utils/bn'

export const isOfferStateClosed = (pairState: PairState) => {
  return (
    pairState === PairState.PerpetualClosed ||
    pairState === PairState.PerpetualBondingCurveClosed ||
    pairState === PairState.PerpetualMigrated
  )
}

export const isBondOfferV3Closed = (offer: BondOfferV3) => {
  const isStateClosed = isOfferStateClosed(offer.pairState)

  return (
    isStateClosed &&
    offer.bidCap.eq(ZERO_BN) &&
    offer.concentrationIndex.eq(ZERO_BN) &&
    offer.bidSettlement.eq(ZERO_BN) &&
    offer.fundsSolOrTokenBalance.eq(ZERO_BN)
  )
}

export const getLendingTokenFromBondingCurve = (bondingCurveType: BondingCurveType) => {
  if (bondingCurveType === BondingCurveType.LinearUsdc) {
    return LendingTokenType.Usdc
  } else if (bondingCurveType === BondingCurveType.LinearBanxSol) {
    return LendingTokenType.BanxSol
  }

  throw new Error(`Unsupported bonding curve type: ${bondingCurveType}`)
}

/**
 *
 * This function converts the raw `tokensPerCollateral` value (denominated in lamports)
 * into a human-readable format, adjusting for the number of decimal places of the lending token.
 *
 * @param {number} tokensPerCollateral - The raw amount of tokens per unit of collateral (denominated in lamports)
 * @param {number} lendingTokenDecimals - The number of decimal places the lending token uses (e.g. 6 for USDC).
 * @returns {string} The formatted token amount as a string for display in the UI.
 *
 * @example
 * Example 1: formatTokensPerCollateral(1500000, 6);
 * Returns: "1.5"
 *
 * @example
 * Example 2: formatTokensPerCollateral(12345, 9);
 * Returns: "0.00001234"
 */
export const formatTokensPerCollateral = (
  tokensPerCollateral: number,
  lendingTokenDecimals: number,
): string => {
  const value = tokensPerCollateral / 10 ** lendingTokenDecimals
  const adjustedValue = parseFloat(value.toPrecision(4))

  return formatTrailingZeros(convertToDecimalString(adjustedValue, 2))
}

export const calcOfferLtvPercent = (props: {
  tokensPerCollateral: number
  lendingTokenDecimals: number
  collateralPrice: number
}): number => {
  const { tokensPerCollateral, collateralPrice, lendingTokenDecimals } = props

  if (!tokensPerCollateral || !collateralPrice) {
    return 0
  }

  const ltvRatio = tokensPerCollateral / (collateralPrice / Math.pow(10, lendingTokenDecimals))
  return Math.round(ltvRatio * 100)
}

export const calculateOfferSize = (offer: Offer): BN => {
  const { fundsSolOrTokenBalance, bidSettlement } = offer

  return new BN(fundsSolOrTokenBalance).add(new BN(bidSettlement))
}

type CalculateNewOfferSizeParams = {
  loanValue: number
  loansAmount: number
}
export const calculateNewOfferSize = ({
  loanValue,
  loansAmount,
}: CalculateNewOfferSizeParams): BN => {
  return new BN(loanValue * loansAmount)
}
