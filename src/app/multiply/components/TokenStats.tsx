import { FC } from 'react'

import classNames from 'classnames'

import { StatInfo, StatsInfoProps } from '@banx/components/StatInfo'
import { Tooltip } from '@banx/components/Tooltip'

import { deepMergeStyles } from '@banx/utils/common'

import { StatContext, StatEntry, TOKEN_CONTENT_MAP } from '../constants'

import styles from '../ClientLendingMultiplyPage.module.scss'

interface TokenStatsProps {
  ticker: string
  stats: StatEntry[]
}

const commonStatClassNames: StatsInfoProps['classNamesProps'] = {
  container: styles.customStatContent,
  label: styles.customStatLabel,
  value: styles.customStatValue,
}

export const TokenStats: FC<TokenStatsProps> = ({ ticker, stats }) => {
  return (
    <div className={getStyleWithModifier('customBodyContent', ticker)}>
      {stats.map(({ label, value, tooltip }) => (
        <Tooltip key={label} label={tooltip} className={styles.customStatContent}>
          <StatInfo
            label={label}
            value={value ?? 'N/A'}
            classNamesProps={deepMergeStyles(commonStatClassNames, {
              label: tooltip ? styles.underlinedLabel : undefined,
              value: getStyleWithModifier('customStatValue', ticker),
            })}
          />
        </Tooltip>
      ))}
    </div>
  )
}

export const createStatsTokenContent = (ticker: string, context: StatContext = {}): StatEntry[] => {
  const stats = TOKEN_CONTENT_MAP[ticker] || []
  return stats.map((stat) => {
    const value = stat.dynamicValue ? stat.dynamicValue(context) : (stat.value ?? 'N/A')
    return { ...stat, value }
  })
}

const getStyleWithModifier = (base: string, modifier: string, fallback = 'default') =>
  classNames(base, styles[`${base}--${modifier.toLowerCase()}`] || styles[`${base}--${fallback}`])
