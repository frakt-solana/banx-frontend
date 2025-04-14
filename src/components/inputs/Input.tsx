import { ChangeEvent, FocusEvent, forwardRef } from 'react'

import { Input as MantineInput, InputProps as MantineInputProps } from '@mantine/core'
import classNames from 'classnames'

import styles from './Inputs.module.scss'

export interface InputProps extends Omit<MantineInputProps, 'value' | 'onChange'> {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  placeholder?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, error, ...rest } = props

  return (
    <MantineInput
      unstyled
      ref={ref}
      error={error}
      classNames={{ input: classNames(styles.input, className), wrapper: styles.inputWrapper }}
      {...rest}
    />
  )
})

Input.displayName = 'Input'
