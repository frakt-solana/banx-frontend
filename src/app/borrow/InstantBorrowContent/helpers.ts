import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT, BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import moment from 'moment'

import { CollateralToken } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { adjustTokenAmountWithUpfrontFee, bnToHuman, stringToBN } from '@banx/utils'

import { BorrowToken } from '../constants'
import { BorrowOffer } from './hooks'

interface GetErrorMessageProps {
  borrowToken: BorrowToken | undefined
  collateral: CollateralToken | undefined
  borrowInputValue: string
}

export const getErrorMessage = ({
  borrowToken,
  borrowInputValue,
  collateral,
}: GetErrorMessageProps) => {
  if (!borrowToken || !collateral) return undefined

  const borrowAmount = stringToBN(borrowInputValue, borrowToken?.collateral.decimals)

  if (collateral?.amountInWallet.isZero()) {
    return `You don't have any ${collateral.collateral.ticker}`
  }

  if (borrowAmount.isZero()) {
    return 'Enter an amount to borrow'
  }

  return
}

export const getSummaryInfo = (
  offer: BorrowOffer | null,
  collateral: CollateralToken | undefined,
) => {
  if (!collateral || !offer) {
    return {
      aprRate: 0,
      weeklyFee: 0,
      upfrontFee: 0,
      borrowableAmount: 0,
      totalCollateralRequired: 0,
      collateralUpfrontFee: 0,
    }
  }

  const {
    upfrontFee: collateralUpfrontFee,
    interestFee: collateralInterestFee,
    decimals: collateralDecimals,
  } = collateral.collateral

  const borrowableAmount = parseFloat(offer.maxTokenToGet)
  const aprRate = calcBorrowerTokenAPR(parseFloat(offer.apr), collateralInterestFee)
  const upfrontFee = (borrowableAmount * collateralUpfrontFee) / BASE_POINTS

  const currentTimeInUnix = moment().unix()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: borrowableAmount,
    startTime: currentTimeInUnix,
    currentTime: currentTimeInUnix + SECONDS_IN_DAY * 7,
    rateBasePoints: aprRate,
  })

  const borrowableAmountWithFee = adjustTokenAmountWithUpfrontFee(
    new BN(borrowableAmount),
    new BN(collateralUpfrontFee),
  ).toNumber()

  const totalCollateralRequired = bnToHuman(
    new BN(offer.maxCollateralToReceive),
    collateralDecimals,
  )

  return {
    aprRate,
    weeklyFee,
    upfrontFee,
    borrowableAmount: borrowableAmountWithFee,
    totalCollateralRequired,
    collateralUpfrontFee,
  }
}

export const getInitialCollateral = (collateralsList: CollateralToken[]) => {
  const [firstCollateral] = collateralsList

  if (!firstCollateral?.amountInWallet.isZero()) {
    return firstCollateral
  }

  return (
    collateralsList.find(({ collateral }) => collateral.mint === BANX_TOKEN_MINT.toBase58()) ||
    firstCollateral
  )
}

export const updateOfferBasedOnBorrow = (props: {
  offer: BorrowOffer
  collateral: CollateralToken
  tokenDecimals: number
  borrowAmount: BN
}): BorrowOffer => {
  const { offer, borrowAmount, collateral, tokenDecimals } = props

  const marketUpfrontFee = new BN(collateral.collateral.upfrontFee)
  const adjustedBorrowAmount = adjustTokenAmountWithUpfrontFee(borrowAmount, marketUpfrontFee, true)

  const maxCollateralAvailable = new BN(offer.maxCollateralToReceive)
  const usableCollateral = BN.min(maxCollateralAvailable, collateral.amountInWallet)

  const maxBorrowableAmount = usableCollateral
    .mul(new BN(10 ** tokenDecimals))
    .divRound(new BN(offer.collateralsPerToken))

  const limitedBorrowAmount = BN.min(maxBorrowableAmount, adjustedBorrowAmount)

  const collateralRequired = limitedBorrowAmount
    .mul(new BN(offer.collateralsPerToken))
    .divRound(new BN(10 ** tokenDecimals))

  const availableCollateral = BN.min(collateralRequired, collateral.amountInWallet)

  const newOffer = {
    ...offer,
    maxTokenToGet: limitedBorrowAmount.toString(),
    maxCollateralToReceive: availableCollateral.toString(),
  }

  return newOffer
}
