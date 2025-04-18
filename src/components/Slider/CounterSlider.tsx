import { FC } from 'react'

import classNames from 'classnames'

import { NumericStepInput } from '../inputs'
import { Slider } from './Slider'
import { SliderProps } from './types'

import styles from './Slider.module.scss'

export const CounterSlider: FC<SliderProps> = ({
  value,
  onChange,
  max = 0,
  label,
  labelClassName,
  className,
  disabled,
}) => {
  const handleNumericInput = (value: string) => {
    onChange(Number(value))
  }

  return (
    <div className={classNames(styles.couterSliderContainer, className)}>
      <Slider
        className={styles.counterSlider}
        value={value}
        onChange={onChange}
        marks={{}}
        max={max}
        label={label}
        labelClassName={labelClassName}
        disabled={disabled}
      />
      <NumericStepInput
        onChange={handleNumericInput}
        value={String(value)}
        max={max}
        step={1}
        className={styles.counterInputContainer}
        disabled={disabled}
      />
    </div>
  )
}
