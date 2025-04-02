import { FC, SVGProps } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ChevronDown, SOLFilled, USDC } from '@banx/icons'

import BackdropDropdown from './BackdropDropdown'

import styles from './Dropdowns.module.scss'

interface Option<T> {
  value: T
  label: string
  icon?: FC<SVGProps<SVGSVGElement>>
}

interface TokenDropdownProps<T> {
  className?: string
  option: T
  options: readonly Option<T>[]
  onChange: (option: T) => void
  size?: 'default' | 'small'
}

export const TokenDropdown = <T extends string>({
  className,
  option,
  options,
  onChange,
  size = 'default',
}: TokenDropdownProps<T>) => {
  const selectedOption = options.find((item) => item.value === option)
  const tokenTicker = selectedOption ? selectedOption.label : null
  const Icon = selectedOption ? selectedOption.icon : null

  const isSmall = size === 'small'

  return (
    <BackdropDropdown
      className={classNames(className, { [styles.small]: isSmall })}
      buttonContent={(isDropdownOpen) => (
        <div className={classNames(styles.tokenDropdownButton, { [styles.small]: isSmall })}>
          {Icon && <Icon className={styles.tokenMarketIcon} />}
          <span
            className={classNames(styles.tokenMarketTicker, {
              [styles.hide]: !!selectedOption?.icon && !isSmall,
            })}
          >
            {tokenTicker}
          </span>
          <ChevronDown
            className={classNames(styles.chevronIcon, {
              [styles.rotate]: isDropdownOpen,
              [styles.small]: isSmall,
            })}
          />
        </div>
      )}
    >
      <ul className={classNames(styles.tokenDropdownList, { [styles.small]: isSmall })}>
        {options.map(({ value, label }) => (
          <li
            key={value}
            className={classNames(styles.tokenDropdownItem, {
              [styles.active]: option === value,
              [styles.small]: isSmall,
            })}
            onClick={() => onChange(value)}
          >
            <RadioCircle isActive={option === value} />
            <div
              className={classNames(styles.tokenDropdownItemText, {
                [styles.small]: isSmall,
              })}
            >
              <span>{label}</span>
            </div>
          </li>
        ))}
      </ul>
    </BackdropDropdown>
  )
}

const RadioCircle: FC<{ isActive: boolean }> = ({ isActive }) => (
  <div
    className={classNames(styles.radioCircle, {
      [styles.radioCircleActive]: isActive,
    })}
  />
)

export const MARKET_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: LendingTokenType.Usdc, label: 'USDC', icon: USDC },
  { value: LendingTokenType.BanxSol, label: 'SOL', icon: SOLFilled },
] as const

export const MARKET_OPTIONS_WITHOUT_ALL = [
  { value: LendingTokenType.Usdc, label: 'USDC', icon: USDC },
  { value: LendingTokenType.BanxSol, label: 'SOL', icon: SOLFilled },
] as const

export type MarketTokenType = LendingTokenType | 'ALL'
