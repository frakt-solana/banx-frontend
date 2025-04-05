import { FC } from 'react'

import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { flow } from 'lodash'
import { divide } from 'lodash/fp'

import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { CollateralToken } from '@banx/api'
import { ZERO_BN, bnToNumberSafe, formatDecimalWithSubscript, getTokenDecimals } from '@banx/utils'

import {
  calcPositionLiquidationPrice,
  calculateNetApr,
  calculateTokenLoanBorrowAmount,
} from '../../helpers'
import { useCollateralYield } from '../../hooks'
import { LeverageSimpleOffer, MultiplyPair } from '../../types'

import styles from './Summary.module.scss'

type SummaryProps = {
  selectedOffer: LeverageSimpleOffer | undefined
  conversionRate: number
  collateralPriceHuman: number
  totalCollateralAmount: BN
  userEnteredCollateralAmount: BN
  collateral: CollateralToken
  pair: MultiplyPair
}

export const Summary: FC<SummaryProps> = ({
  totalCollateralAmount,
  conversionRate,
  collateralPriceHuman,
  selectedOffer,
  userEnteredCollateralAmount,
  collateral,
  pair,
}) => {
  const marketTokenDecimals = getTokenDecimals(pair.marketTokenType)
  const { collateralYield } = useCollateralYield(pair)

  const borrowAmount = selectedOffer
    ? calculateTokenLoanBorrowAmount(
        totalCollateralAmount.sub(userEnteredCollateralAmount),
        conversionRate,
        marketTokenDecimals,
        collateral.collateral.decimals,
      )
    : ZERO_BN
  const borrowAmountHuman = bnToNumberSafe(borrowAmount) / 10 ** marketTokenDecimals

  const marketUpfrontFee = collateral?.collateral.upfrontFee || 0
  const marketInterestFee = collateral?.collateral.interestFee || 0

  const upfrontFee = new BN(borrowAmount).mul(new BN(marketUpfrontFee)).div(new BN(BASE_POINTS))

  const aprRate = selectedOffer
    ? calcBorrowerTokenAPR(selectedOffer.apr.toNumber(), marketInterestFee)
    : 0

  const netApr = selectedOffer
    ? calculateNetApr({
        totalCollateralAmount,
        userEnteredCollateralAmount,
        conversionRate,
        aprRate,
        collateralYield,
        tokenDecimals: marketTokenDecimals,
        collateralDecimals: collateral.collateral.decimals,
      })
    : 0

  const upfrontFeePercent = marketUpfrontFee / 100

  const liquidationLtv = selectedOffer?.liquidationLtvBp
    ? flow(bnToNumberSafe, divide(BASE_POINTS))(selectedOffer.liquidationLtvBp)
    : undefined

  const loanLtv = selectedOffer
    ? flow(calculateTokenLoanBorrowAmount, bnToNumberSafe, divide(bnToNumberSafe(borrowAmount)))(
        totalCollateralAmount,
        conversionRate,
        marketTokenDecimals,
        collateral.collateral.decimals,
      )
    : undefined

  const liquidationPriceHuman =
    loanLtv && liquidationLtv
      ? calcPositionLiquidationPrice(collateralPriceHuman, loanLtv, liquidationLtv)
      : undefined

  const statClassNames = {
    value: styles.fixedStatValue,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Borrow APR"
        value={`${(aprRate / 100).toFixed(1)}%`}
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="NET APR"
        value={`${netApr.toFixed(1)}%`}
        classNamesProps={statClassNames}
        tooltipText="An annual percentage rate that combines collateral yield and loan interest rates to show the total interest cost or yield in one clear rate"
        flexType="row"
      />
      <StatInfo
        label="Liquidation price"
        value={
          liquidationPriceHuman ? (
            <DisplayValue
              strictTokenType={pair.marketTokenType}
              value={liquidationPriceHuman}
              isSubscriptFormat
            />
          ) : (
            '--'
          )
        }
        classNamesProps={{ ...statClassNames, container: styles.statWithMarginBottom }}
        flexType="row"
      />
      <StatInfo
        label="Position size"
        value={`${formatDecimalWithSubscript(
          bnToNumberSafe(totalCollateralAmount) / 10 ** collateral?.collateral.decimals,
        )} ${pair.collateralTicker}`}
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Loan value"
        value={
          <DisplayValue
            strictTokenType={pair.marketTokenType}
            value={borrowAmountHuman}
            isSubscriptFormat
          />
        }
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Upfront fee"
        value={
          <DisplayValue
            strictTokenType={pair.marketTokenType}
            value={bnToNumberSafe(upfrontFee) / 10 ** marketTokenDecimals}
            isSubscriptFormat
          />
        }
        tooltipText={`${upfrontFeePercent}% upfront fee charged on the loan principal amount, paid when loan is funded`}
        classNamesProps={statClassNames}
        flexType="row"
      />
    </div>
  )
}
