import { ReactNode } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'

import NumericInput from '@banx/components/inputs/NumericInput'

import { core } from '@banx/api'
import { useModal } from '@banx/store/common'

import ModalTokenSelect from '../ModalTokenSelect'
import { SelectTokenButton } from './components'

import styles from './InputTokenSelect.module.scss'

interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: BN
}

interface InputTokenSelectProps<T extends BaseToken> {
  label: string
  value: string
  onChange: (value: string) => void

  selectedToken: T | undefined
  tokensList: T[]
  onChangeToken: (option: T) => void

  rightContentJSX?: ReactNode

  className?: string
  disabled?: boolean
}

const InputTokenSelect = <T extends BaseToken>({
  label,
  value,
  onChange,
  className,
  selectedToken,
  tokensList,
  onChangeToken,
  disabled,
  rightContentJSX = null,
}: InputTokenSelectProps<T>) => {
  const { open: openModal } = useModal()

  const handleOpenModal = () => {
    openModal(ModalTokenSelect, { onChangeToken, tokensList, selectedToken })
  }

  return (
    <div className={classNames(styles.inputTokenSelect, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <span className={styles.inputTokenSelectLabel}>{label}</span>
        {rightContentJSX}
      </div>
      <div className={styles.inputTokenSelectWrapper}>
        <NumericInput
          value={value}
          onChange={onChange}
          className={styles.numericInput}
          disabled={disabled}
          placeholder="0"
        />

        <SelectTokenButton
          onClick={handleOpenModal}
          token={selectedToken}
          className={styles.inputTokenSelectButton}
        />
      </div>
    </div>
  )
}

export default InputTokenSelect
