import React, { ChangeEvent, FC } from 'react'

import { isFinite, toNumber } from 'lodash'

import { Input, InputProps } from './Input'

export interface NumericInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void

  placeholder?: string
  positiveOnly?: boolean
  integerOnly?: boolean
  className?: string
  error?: boolean
  disabled?: boolean
}

const NumericInput: FC<NumericInputProps> = ({
  onChange,
  value,
  positiveOnly,
  integerOnly,
  ...props
}) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = event.target

    if (positiveOnly && inputValue.startsWith('-')) return
    if (integerOnly && inputValue.includes('.')) return

    if (inputValue === '-' || inputValue === '' || isFinite(toNumber(inputValue))) {
      onChange(inputValue)
    }
  }

  //? Handle focus: Clear "0" values when a field is focused
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '0') {
      onChange('')
    }
  }
  //? Handle blur: Revert empty fields to "0" when a field loses focus
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      onChange('0')
    }
  }

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  )
}

export default NumericInput
