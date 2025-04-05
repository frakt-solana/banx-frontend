import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import NumericInput from '@banx/components/inputs/NumericInput'

import { CollateralToken } from '@banx/api'
import { ChevronDown, Wallet } from '@banx/icons'
import { useModal } from '@banx/store'
import { ZERO_BN, bnToHuman } from '@banx/utils'

import { ResponsiveImage } from '../ResponsiveImage'
import ModalTokenSelect from './ModalTokenSelect'

import styles from './TokenInput.module.scss'

type TokenInputProps = {
  label: string
  value: string //? int with token decimals
  onChange: (value: string) => void

  selectedToken: CollateralToken | undefined
  tokensList?: CollateralToken[]
  onChangeToken?: (option: CollateralToken) => void
  pinnedTokensMints?: string[]

  className?: string
  disabled?: boolean
}

const TokenInput = ({
  label,
  value,
  onChange,
  className,
  selectedToken,
  tokensList,
  onChangeToken,
  pinnedTokensMints,
  disabled,
}: TokenInputProps) => {
  const { connected } = useWallet()
  const { open: openModal } = useModal()

  const handleOpenModal = () => {
    openModal(ModalTokenSelect, { onChangeToken, tokensList, pinnedTokensMints })
  }

  return (
    <div className={classNames(styles.inputTokenSelect, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <span className={styles.inputTokenSelectLabel}>{label}</span>
        {connected ? (
          <ControlsButtons
            onChange={onChange}
            maxValue={bnToHuman(
              selectedToken?.amountInWallet || ZERO_BN,
              selectedToken?.collateral.decimals,
            )}
          />
        ) : null}
      </div>
      <div className={styles.inputTokenSelectWrapper}>
        <NumericInput
          value={value}
          onChange={onChange}
          className={styles.numericInput}
          disabled={disabled}
          placeholder="0"
          positiveOnly
        />

        <SelectTokenButton
          onClick={handleOpenModal}
          token={selectedToken}
          className={styles.inputTokenSelectButton}
          disabled={!tokensList || tokensList.length < 2}
        />
      </div>
    </div>
  )
}

export default TokenInput

type SelectTokenButtonProps = {
  token: CollateralToken | undefined
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const SelectTokenButton = ({ token, onClick, disabled, className }: SelectTokenButtonProps) => {
  if (!token) {
    return <Skeleton.Button style={{ width: 100 }} className={className} />
  }

  return (
    <Button
      onClick={onClick}
      className={classNames(
        styles.selectTokenButton,
        { [styles.selectTokenButtonDisabled]: disabled },
        className,
      )}
      variant="tertiary"
    >
      <ResponsiveImage src={token.collateral.logoUrl} className={styles.selectTokenButtonIcon} />
      {token.collateral.ticker}
      {!disabled && <ChevronDown className={styles.selectTokenButtonChevronIcon} />}
    </Button>
  )
}

type ControlsButtonsProps = {
  onChange: (value: string) => void
  maxValue: number | undefined
}

const ControlsButtons: FC<ControlsButtonsProps> = ({ onChange, maxValue = 0 }) => {
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
        <Wallet /> {formatNumber(maxValue)}
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
    maximumFractionDigits: 1,
  }).format(value)
}
