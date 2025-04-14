import { SliderValueFormat } from './types'

export const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

export const FORMATTERS: Record<SliderValueFormat, (value: number) => string> = {
  number: (value) => `${value}`,
  percent: (value) => `${value}%`,
  sol: (value) => `${value} SOL`,
  multiplier: (value) => `x${value}`,
}
