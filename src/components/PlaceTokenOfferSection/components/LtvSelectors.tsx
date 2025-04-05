import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'

import { TokenMarketPreview } from '@banx/api/tokens'
import {
  convertToDecimalString,
  formatTokensPerCollateral,
  formatTrailingZeros,
  getTokenDecimals,
} from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.scss'

const LTV_PERCENTAGES = [60, 75, 90]

interface LtvActionButtonsProps {
  onChangePercent: (percent: number) => void
  onChangeTopOffer: () => void
  bestOffer?: number
}

const LtvActionButtons: FC<LtvActionButtonsProps> = ({
  onChangePercent,
  onChangeTopOffer,
  bestOffer = 0,
}) => {
  return (
    <>
      {LTV_PERCENTAGES.map((percent) => (
        <Button
          key={percent}
          onClick={() => onChangePercent(percent)}
          variant="tertiary"
          size="small"
        >
          {percent}%
        </Button>
      ))}

      <Button
        onClick={onChangeTopOffer}
        className={styles.ltvActionButton}
        disabled={!bestOffer}
        variant="tertiary"
        size="small"
      >
        Top
      </Button>
    </>
  )
}

interface LtvValueSelectorProps {
  market: TokenMarketPreview | undefined
  onChange: (value: string) => void
  lendingToken: LendingTokenType
}

export const LtvValueSelector: FC<LtvValueSelectorProps> = ({ market, onChange, lendingToken }) => {
  const { collateralPrice = 0, bestOffer = 0 } = market || {}
  const lendingTokenDecimals = getTokenDecimals(lendingToken)

  const handlePercentChange = (percent: number) => {
    const value = calculatePercentValue(collateralPrice, lendingTokenDecimals, percent)
    onChange(value)
  }

  const handleTopOfferSelection = () => {
    const value = formatTopOfferValue(bestOffer, lendingTokenDecimals)
    onChange(value)
  }

  return (
    <div className={styles.ltvActionPanel}>
      <span className={styles.ltvActionLabel}>LTV</span>
      <LtvActionButtons
        onChangePercent={handlePercentChange}
        onChangeTopOffer={handleTopOfferSelection}
        bestOffer={bestOffer}
      />
    </div>
  )
}

interface LtvPercentageSelectorProps {
  market: TokenMarketPreview | undefined
  onChange: (value: string) => void
}

export const LtvPercentageSelector: FC<LtvPercentageSelectorProps> = ({ market, onChange }) => {
  const { collateralPrice = 0, bestOffer = 0 } = market || {}

  const handlePercentChange = (percent: number) => {
    onChange(percent.toString())
  }

  const handleTopOfferSelection = () => {
    const ltvPercent = Math.round((bestOffer / collateralPrice) * 100)
    onChange(ltvPercent.toString())
  }

  return (
    <div className={styles.ltvActionPanel}>
      <LtvActionButtons
        onChangePercent={handlePercentChange}
        onChangeTopOffer={handleTopOfferSelection}
        bestOffer={bestOffer}
      />
    </div>
  )
}

const calculatePercentValue = (
  collateralPrice: number,
  tokenDecimals: number,
  percent: number,
): string => {
  const rawValue = ((collateralPrice / 10 ** tokenDecimals) * percent) / 100
  const adjustedValue = parseFloat(rawValue.toPrecision(4))
  return convertToDecimalString(adjustedValue, 2)
}

const formatTopOfferValue = (bestOffer: number, tokenDecimals: number): string => {
  const rawValue = parseFloat(formatTokensPerCollateral(bestOffer, tokenDecimals))
  const decimalPlaces = getCollateralDecimalPlaces(rawValue)
  return formatTrailingZeros(rawValue.toFixed(decimalPlaces))
}

const getCollateralDecimalPlaces = (value: number) => {
  const DECIMAL_PLACES_RULES = [
    { limit: 1, decimalPlaces: 2 }, //? Values up to 1 have 0 decimal places
    { limit: 0.001, decimalPlaces: 4 }, //? Values up to 0.001 have 4 decimal places
    { limit: 0, decimalPlaces: 6 }, //? Values greater than 0 but less than 0.001 have 6 decimal places
  ]

  return DECIMAL_PLACES_RULES.find(({ limit }) => value > limit)?.decimalPlaces ?? 2
}
