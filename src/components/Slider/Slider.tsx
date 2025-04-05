import { FC, JSX, useMemo } from 'react'

import { Slider as SliderAntd } from 'antd'
import classNames from 'classnames'
import _ from 'lodash'

import Tooltip from '../Tooltip'

import styles from './Slider.module.scss'

const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

export interface SliderProps {
  label?: string
  tooltipText?: string
  labelClassName?: string
  value: number
  onChange: (nextValue: number) => void
  marks?: { [key: number]: string | JSX.Element }
  step?: number
  max?: number
  min?: number
  className?: string
  rootClassName?: string
  disabled?: boolean
  showValue?: keyof typeof SLIDER_WITH_VALUE_CLASSNAME
}

//? Described in global silder.scss file
const SLIDER_WITH_VALUE_CLASSNAME = {
  number: 'sliderWithValue',
  percent: 'sliderWithValuePercent',
  sol: 'sliderWithValueSol',
  multiplier: 'sliderWithValueMultiplier',
} as const

export const Slider: FC<SliderProps> = ({
  label,
  labelClassName,
  value,
  marks = DEFAULT_SLIDER_MARKS,
  step = 1,
  className,
  rootClassName,
  showValue,
  tooltipText,
  disabled,
  max = 100,
  min = 0,
  ...props
}) => {
  const marksFormatted = useMemo(() => {
    //? If slider handle doesn't show live value -- ignore
    if (!showValue) {
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
  }, [marks, max, min, showValue, value])

  return (
    <div className={classNames(styles.slider, { [styles.sliderWithValue]: showValue }, className)}>
      {!!label && (
        <div className={styles.labels}>
          <p className={classNames(styles.label, labelClassName)}>{label}</p>
          {tooltipText && <Tooltip title={tooltipText} />}
        </div>
      )}
      <SliderAntd
        rootClassName={classNames(
          'rootSliderClassName',
          { [SLIDER_WITH_VALUE_CLASSNAME[showValue || 'number']]: !!showValue },
          { ['sliderDisabled']: disabled },
          rootClassName,
        )}
        marks={marksFormatted}
        disabled={disabled}
        step={step}
        tooltip={{
          open: false,
        }}
        max={max}
        min={min}
        value={value}
        {...props}
      />
    </div>
  )
}
