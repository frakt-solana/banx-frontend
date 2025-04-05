import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import moment from 'moment'

import { convertBondOfferV3ToCore } from '@banx/api'
import { TokenLoan, core } from '@banx/api'
import {
  bnToNumberSafe,
  caclulateBorrowTokenLoanValue,
  calcOfferLtvPercent,
  calculateLentTokenValueWithInterest,
  calculateOfferSize,
  calculateTokenLoanLtvByLoanValue,
  calculateTokenRepaymentCallLenderReceivesAmount,
  formatTokensPerCollateral,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

//? constants
const MAX_LTV_THRESHOLD = 100

export const calculateFreezeExpiredAt = (loan: core.TokenLoan) => {
  return loan.bondTradeTransaction.soldAt + loan.bondTradeTransaction.terminationFreeze
}

export const checkIfFreezeExpired = (loan: core.TokenLoan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const currentTimeInSeconds = moment().unix()
  return currentTimeInSeconds > freezeExpiredAt
}

export const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const DEFAULT_REPAY_PERCENT = 50

  const repaymentCallActive = isTokenLoanRepaymentCallActive(loan)

  const repaymentCallLenderReceives = calculateTokenRepaymentCallLenderReceivesAmount(loan)

  const totalClaim = calculateLentTokenValueWithInterest(loan).toNumber()

  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallLenderReceives / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallLenderReceives
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}

const BASE_POINTS_BN = new BN(BASE_POINTS)
export const calculateCollateralsPerTokenByFromLtv = (params: { ltv: BN; tokenPrice: BN }): BN => {
  const { ltv, tokenPrice } = params
  return tokenPrice.mul(BASE_POINTS_BN).div(ltv)
}

export const calculateCollateralsPerTokenByLoan = (
  loan: core.TokenLoan,
  marketTokenDecimals: number,
): BN => {
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, lentTokenValueWithInterest)

  const collateralTokenDecimals = loan.collateral.decimals
  const collateralTokenDecimalsMultiplier = new BN(10 ** collateralTokenDecimals)
  const marketTokenDecimalsMultiplier = new BN(10 ** marketTokenDecimals)

  const loanCollateralsPerToken = calculateCollateralsPerTokenByFromLtv({
    ltv: new BN(ltvPercent * 100),
    tokenPrice: collateralTokenDecimalsMultiplier
      .mul(marketTokenDecimalsMultiplier)
      .div(new BN(loan.collateralPrice)),
  })

  return loanCollateralsPerToken
}

export const findBestOffer = (props: {
  loan: TokenLoan
  offers: BondOfferV3[]
  lendingTokenDecimals: number
  walletPubkey: string
}): BondOfferV3 | undefined => {
  const { loan, offers, lendingTokenDecimals, walletPubkey } = props

  const loanDebt = caclulateBorrowTokenLoanValue(loan)
  const maxCollateralsPerToken = calculateCollateralsPerTokenByLoan(loan, lendingTokenDecimals)
  const loanApr = loan.bondTradeTransaction.amountOfBonds

  return (
    chain(offers)
      //? 1) Exclude user’s own offers
      .filter((offer) => offer.assetReceiver.toBase58() !== walletPubkey)

      //? 2) Exclude offers that cannot fully cover the loan debt
      .filter((offer) => {
        const coreOffer = convertBondOfferV3ToCore(offer)
        const offerSize = calculateOfferSize(coreOffer)
        return loanDebt.lt(offerSize)
      })

      //? 3) Exclude offers with an LTV lower than the loan's LTV requirement
      .filter((offer) => offer.validation.collateralsPerToken.lte(maxCollateralsPerToken))

      //? 4) Exclude offers with an APR greater than the current loan APR
      .filter((offer) => offer.loanApr.toNumber() <= loanApr)

      //? (5) Exclude offers that exceed the maximum allowed LTV threshold
      .filter((offer) => {
        const tokensPerCollateralFloat = calculateTokensPerCollateralFloat(
          bnToNumberSafe(offer.validation.collateralsPerToken),
          loan.collateral.decimals,
          lendingTokenDecimals,
        )

        const tokensPerCollateral = parseFloat(
          formatTokensPerCollateral(tokensPerCollateralFloat, lendingTokenDecimals),
        )

        const ltvPercent = calcOfferLtvPercent({
          tokensPerCollateral,
          collateralPrice: loan.collateralPrice,
          lendingTokenDecimals: lendingTokenDecimals,
        })

        return ltvPercent <= MAX_LTV_THRESHOLD
      })

      //? 6) Sort by APR in ascending order and pick the first
      .sortBy((offer) => offer.loanApr.toNumber())
      .first()
      .value()
  )
}
