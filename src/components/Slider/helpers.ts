import _ from 'lodash'

import { FORMATTERS } from './constants'
import { MantineMarks, SliderValueFormat } from './types'

export const formatSliderLabel = (format: SliderValueFormat | undefined, value: number): string => {
  if (!format) return ''
  return FORMATTERS[format]?.(value) ?? `${value}`
}

export const getFormattedMarks = (
  marks: MantineMarks,
  value: number,
  min: number,
  max: number,
  shouldHideInternalLabels: boolean,
) => {
  if (!shouldHideInternalLabels) {
    return marks
  }

  const progress = (value - min) / (max - min)

  //? If slider handle shows live value -- show only border labels

  const HIDE_BORDER_LABELS_OFFSET = 0.1

  return _.chain(marks)
    .entries()
    .map(([value, label], idx, marks) => {
      const numberValue = parseFloat(value)

      //? Min value mark
      if (idx === 0 && numberValue === min) {
        const showLabel = progress > HIDE_BORDER_LABELS_OFFSET
        return [value, showLabel ? label : ' ']
      }
      //? Max value mark
      if (idx === marks.length - 1 && numberValue === max) {
        const showLabel = progress < 1 - HIDE_BORDER_LABELS_OFFSET
        return [value, showLabel ? label : ' ']
      }

      //? Remove label from other marks
      return [value, ' ']
    })
    .fromPairs()
    .value()
}
