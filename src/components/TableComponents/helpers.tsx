import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { useTokenType } from '@banx/store'
import { parseLabel } from '@banx/utils/common'
import {
  TokenUnit,
  formatDecimalWithSubscript,
  formatValueByTokenType,
  getTokenUnit,
} from '@banx/utils/tokens'

import Tooltip from '../Tooltip'

import styles from './TableCells.module.scss'

const formatDisplayValue = (
  initialValue: number,
  formattedValue: string,
  unit: string,
  zeroPlaceholder = '--',
) => {
  return initialValue ? `${formattedValue}${unit}` : zeroPlaceholder
}

export const createPercentValueJSX = (initialValue = 0, zeroPlaceholder = '--') => {
  const formattedValue = initialValue.toFixed(0)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '%', zeroPlaceholder)

  return <span className={styles.value}>{displayValue}</span>
}

export const createTimeValueJSX = (initialValue: number, zeroPlaceholder = '--') => {
  const formattedValue = moment.unix(initialValue).fromNow(false)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '', zeroPlaceholder)

  return <span className={styles.value}>{displayValue}</span>
}

export const createDisplayValueJSX = (value: string, tokenUnit: `${TokenUnit}`) => {
  if (tokenUnit === TokenUnit.Usdc) {
    //? Added dollar sign before '<' for better readability
    //? Change order of the operators to avoid confusion

    const operator = value.startsWith('<') ? '<' : ''
    const cleanedValue = value.replace('<', '')

    return (
      <span className={styles.displayValue}>
        {operator}
        {tokenUnit}
        {cleanedValue}
      </span>
    )
  }

  return (
    <span className={styles.displayValue}>
      {value}
      {tokenUnit}
    </span>
  )
}

interface DisplayValueProps {
  value: number
  strictTokenType?: LendingTokenType
  placeholder?: string
  isSubscriptFormat?: boolean
}

export const DisplayValue: FC<DisplayValueProps> = ({
  value,
  strictTokenType,
  placeholder,
  isSubscriptFormat = false,
}) => {
  const { tokenType: appTokenType } = useTokenType()

  const tokenType = strictTokenType || appTokenType

  const formattedValue = isSubscriptFormat
    ? formatDecimalWithSubscript(value)
    : formatValueByTokenType(value, tokenType)

  const tokenUnit = getTokenUnit(tokenType)
  const defaultPlaceholder = placeholder ?? createDisplayValueJSX('0', tokenUnit)

  return formattedValue ? createDisplayValueJSX(formattedValue, tokenUnit) : defaultPlaceholder
}

type MarketLabelDisplayProps = {
  label: string
}

export const MarketLabelDisplay: FC<MarketLabelDisplayProps> = ({ label }) => {
  const { protocol, ticker } = parseLabel(label)

  return (
    <Tooltip label={label}>
      <div className={styles.marketLabels}>
        {protocol ? (
          <>
            <div className={styles.protocol}>{protocol}</div>
            <div className={styles.ticker}>{ticker}</div>
          </>
        ) : (
          <div className={styles.ticker}>{ticker}</div>
        )}
      </div>
    </Tooltip>
  )
}
