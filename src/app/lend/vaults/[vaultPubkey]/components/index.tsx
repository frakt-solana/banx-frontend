import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import NumericInput from '@banx/components/inputs/NumericInput'

import { SOL, USDC, Wallet } from '@banx/icons'
import { formatCompact } from '@banx/utils/common'
import { getTokenDecimals, getTokenTicker } from '@banx/utils/tokens'

import styles from './ManageVault/ManageVault.module.scss'

interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  maxValue: number
  tokenType: LendingTokenType
  disabled?: boolean
}

export const Input: FC<InputProps> = ({
  label,
  value,
  onChange,
  maxValue,
  tokenType,
  disabled,
}) => {
  const tokenTicker = getTokenTicker(tokenType)

  const tokenIcon = tokenType === LendingTokenType.Usdc ? <USDC viewBox="1 1 14 14" /> : <SOL />

  return (
    <div className={styles.input}>
      <div className={styles.inputHeader}>
        <span className={styles.inputLabel}>{label}</span>
        <ControlsButtons onChange={onChange} maxValue={maxValue} tokenType={tokenType} />
      </div>
      <div className={styles.inputWrapper}>
        <span className={styles.inputToken}>
          {tokenIcon}
          {tokenTicker}
        </span>
        <NumericInput
          value={value}
          onChange={onChange}
          className={styles.numericInput}
          disabled={disabled}
          placeholder="0"
        />
      </div>
    </div>
  )
}

interface ControlsButtonsProps {
  onChange: (value: string) => void
  maxValue: number | undefined
  tokenType: LendingTokenType
}

export const ControlsButtons: FC<ControlsButtonsProps> = ({
  onChange,
  maxValue = 0,
  tokenType,
}) => {
  const marketTokenDecimals = getTokenDecimals(tokenType)

  const formatValueToHumanReadableStr = (value: number) => {
    return (value / 10 ** marketTokenDecimals).toString()
  }

  const onMaxClick = () => {
    onChange(formatValueToHumanReadableStr(maxValue))
  }

  const onHalfClick = () => {
    const nextValue = maxValue / 2
    onChange(formatValueToHumanReadableStr(nextValue))
  }

  return (
    <div className={styles.inputControlsButtons}>
      <div className={styles.inputMaxTokenBalance}>
        <Wallet /> {formatCompact(formatValueToHumanReadableStr(maxValue), 2)}
      </div>

      <Button
        onClick={onHalfClick}
        className={styles.inputControlButton}
        variant="tertiary"
        size="small"
      >
        Half
      </Button>
      <Button
        onClick={onMaxClick}
        className={styles.inputControlButton}
        variant="tertiary"
        size="small"
      >
        Max
      </Button>
    </div>
  )
}

interface DepositOverviewSwitcherProps {
  value: 'performance' | 'activity'
  onClick: () => void
}

export const DepositOverviewSwitcher: FC<DepositOverviewSwitcherProps> = ({ value, onClick }) => {
  return (
    <div className={styles.depositOverviewSwitcher} onClick={onClick}>
      <div
        className={classNames(styles.depositOverviewSwitcherItem, {
          [styles.active]: value === 'activity',
        })}
      >
        <span className={styles.depositOverviewSwitcherItemTitle}>Activity</span>
      </div>
      <div
        className={classNames(styles.depositOverviewSwitcherItem, {
          [styles.active]: value === 'performance',
        })}
      >
        <span className={styles.depositOverviewSwitcherItemTitle}>Performance</span>
      </div>
    </div>
  )
}
