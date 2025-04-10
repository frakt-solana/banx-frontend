import { FC, useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Slider, SliderProps } from '@banx/components/Slider'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { CollateralToken } from '@banx/api'
import { useDebounce } from '@banx/hooks'
import { Wallet } from '@banx/icons'
import { useModal, useTokenType } from '@banx/store/common'
import { ZERO_BN, bnToHuman } from '@banx/utils/bn'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'
import { formatValueByTokenType, getTokenUnit } from '@banx/utils/tokens'

import { SelectTokenButton } from '../components/InputTokenSelect'
import ModalTokenSelect from '../components/ModalTokenSelect'
import { DEBOUNCE_DELAY_MS } from './constants'
import { getSummaryInfo } from './helpers'
import { BorrowOffer } from './hooks'

import styles from './InstantBorrowContent.module.scss'

interface WarningModalProps {
  offer: BorrowOffer | null
  collateral: CollateralToken | undefined
  onSubmit: () => void
}

export const WarningModal: FC<WarningModalProps> = ({ offer, onSubmit, collateral }) => {
  const { close: closeModal } = useModal()
  const { tokenType } = useTokenType()

  const { aprRate, weeklyFee, borrowableAmount, totalCollateralRequired } = getSummaryInfo(
    offer,
    collateral,
  )

  const tokenUnit = getTokenUnit(tokenType)

  const formattedValues = {
    borrowableAmount: formatValueByTokenType(borrowableAmount, tokenType),
    weeklyFee: formatValueByTokenType(weeklyFee, tokenType),
    totalCollateralRequired: formatNumber(totalCollateralRequired),
    apr: (aprRate / 100).toFixed(0),
  }

  return (
    <Modal opened onClose={closeModal} classNames={{ content: styles.warningModalContent }}>
      <div className={styles.warningModalBody}>
        <h3 className={styles.warningModalTitle}>Please pay attention!</h3>

        <div className={styles.warningModalText}>
          The selected offer can only provide a total of{' '}
          <span className={styles.warningModalTokenValue}>
            {createDisplayValueJSX(formattedValues.borrowableAmount, tokenUnit)}
          </span>{' '}
          secured by{' '}
          <span className={styles.warningModalTokenRow}>
            {formattedValues.totalCollateralRequired} {collateral?.collateral.ticker}
          </span>{' '}
          with an APR of {formattedValues.apr}%. The estimated weekly fee is{' '}
          <span className={styles.warningModalTokenValue}>
            {createDisplayValueJSX(formattedValues.weeklyFee, tokenUnit)}
          </span>
        </div>
      </div>

      <div className={styles.warningModalFooter}>
        <Button onClick={closeModal} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className={styles.confirmButton}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

const formatNumber = (value = 0) => {
  if (!value) return '--'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

interface LtvSliderProps extends SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  maxAvailableLtv: number
}

export const LtvSlider: FC<LtvSliderProps> = ({
  label,
  value,
  onChange,
  maxAvailableLtv,
  ...props
}) => {
  const [localSliderValue, setLocalSliderValue] = useState(value)

  const debouncedSetLtvSlider = useDebounce<number>((val) => onChange(val!), DEBOUNCE_DELAY_MS)

  useEffect(() => {
    setLocalSliderValue(value)
  }, [value])

  const handleSliderChange = (newValue: number) => {
    setLocalSliderValue(newValue)
    debouncedSetLtvSlider(newValue)
  }

  const sliderColorClassName = getColorByPercent(localSliderValue, {
    25: styles.maxLtvSliderGreen,
    50: styles.maxLtvSliderYellow,
    75: styles.maxLtvSliderOrange,
    100: styles.maxLtvSliderRed,
  })

  const getSliderRailClassName = (value: number): string => {
    if (value <= 25) return styles.sliderRailGreen
    if (value <= 50) return styles.sliderRailYellow
    if (value <= 75) return styles.sliderRailOrange
    return styles.sliderRailRed
  }

  const sliderRailClassName = getSliderRailClassName(maxAvailableLtv)
  const labelColor = getColorByPercent(localSliderValue, HealthColorIncreasing)

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabels}>
        <p className={styles.loanValueLabel}>
          {label}:{' '}
          <span className={styles.loanValue} style={{ color: labelColor }}>
            {localSliderValue.toFixed(0)}%
          </span>
        </p>
      </div>

      <Slider
        value={localSliderValue}
        onChange={handleSliderChange}
        min={10}
        max={maxAvailableLtv}
        marks={{}}
        rootClassName={sliderColorClassName}
        className={classNames(styles.ltvSlider, sliderRailClassName)}
        {...props}
      />
    </div>
  )
}

interface CollateralFieldProps {
  label: string
  value: string
  collateral: CollateralToken | undefined
  onChange: (token: CollateralToken) => void
  tokensList: CollateralToken[]
}

export const CollateralField: FC<CollateralFieldProps> = ({
  label,
  value,
  collateral,
  tokensList,
  onChange,
}) => {
  const { amountInWallet = ZERO_BN, collateral: { decimals = 0 } = {} } = collateral || {}

  const { connected } = useWallet()
  const { open: openModal } = useModal()

  const handleOpenModal = () => {
    openModal(ModalTokenSelect, { onChangeToken: onChange, tokensList, selectedToken: collateral })
  }

  return (
    <div className={styles.collateralField}>
      <div className={styles.collateralFieldLabelWrapper}>
        <span className={styles.collateralFieldLabel}>{label}</span>
        {connected && (
          <span className={styles.collateralFieldBalance}>
            <Wallet /> {formatNumber(bnToHuman(amountInWallet, decimals))}
          </span>
        )}
      </div>
      <div className={styles.collateralFieldContent}>
        <SelectTokenButton onClick={handleOpenModal} token={collateral} />
        <span className={styles.collateralFieldValue}>{value}</span>
      </div>
    </div>
  )
}
