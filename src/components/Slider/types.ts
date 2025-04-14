import { SliderProps as MantineSliderProps, SliderStylesNames } from '@mantine/core'

export type SliderValueFormat = 'number' | 'percent' | 'sol' | 'multiplier'

export type MantineMarks = { [key: number]: string }

export interface BaseSliderProps {
  value: number
  onChange: (value: number) => void

  label?: string
  labelClassName?: string
  tooltipText?: string
  valueFormat?: SliderValueFormat

  marks?: MantineMarks
  rootClassName?: string
  className?: string
  classNames?: Partial<Record<SliderStylesNames, string>>
}

export type SliderProps = BaseSliderProps &
  Omit<MantineSliderProps, 'marks' | 'value' | 'onChange' | 'classNames'>
