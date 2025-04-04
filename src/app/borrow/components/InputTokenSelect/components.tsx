import { FC } from 'react'

import { Skeleton } from 'antd'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'

import { ChevronDown, Wallet } from '@banx/icons'

import { BaseToken } from '../ModalTokenSelect/ModalTokenSelect'

import styles from './InputTokenSelect.module.scss'

interface SelectTokenButtonProps<T extends BaseToken> {
  token: T | undefined
  onClick: () => void
  className?: string
}

export const SelectTokenButton = <T extends BaseToken>({
  token,
  onClick,
  className,
}: SelectTokenButtonProps<T>) => {
  if (!token) {
    return <Skeleton.Button style={{ width: 100 }} className={className} />
  }

  return (
    <Button
      onClick={onClick}
      className={classNames(styles.selectTokenButton, className)}
      variant="tertiary"
    >
      <ResponsiveImage src={token.collateral.logoUrl} className={styles.selectTokenButtonIcon} />
      {token.collateral.ticker}
      <ChevronDown className={styles.selectTokenButtonChevronIcon} />
    </Button>
  )
}

interface ControlsButtonsProps {
  onChange: (value: string) => void
  maxValue: number | undefined
  hideIcon?: boolean
}

export const ControlsButtons: FC<ControlsButtonsProps> = ({ onChange, maxValue = 0, hideIcon }) => {
  const onMaxClick = () => {
    onChange(maxValue.toString())
  }

  const onHalfClick = () => {
    const nextValue = maxValue / 2
    onChange(nextValue.toString())
  }

  return (
    <div className={styles.inputControlsButtons}>
      <div className={styles.inputMaxTokenBalance}>
        {hideIcon ? null : <Wallet />} {formatNumber(maxValue)}
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

const formatNumber = (value = 0) => {
  if (!value) return '0'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}
