import { FC, useMemo } from 'react'

import { Slider as MantineSlider } from '@mantine/core'
import classNames from 'classnames'

import { deepMergeStyles } from '@banx/utils/common'

import Tooltip from '../Tooltip'
import { DEFAULT_SLIDER_MARKS } from './constants'
import { formatSliderLabel, getFormattedMarks } from './helpers'
import { SliderProps } from './types'

import styles from './Slider.module.scss'

export const Slider: FC<SliderProps> = ({
  value,
  onChange,
  label,
  labelClassName,
  tooltipText,
  valueFormat,
  marks = DEFAULT_SLIDER_MARKS,
  className,
  rootClassName,
  classNames: userClassNames,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  ...rest
}) => {
  const mantineMarks = useMemo(() => {
    const marksFormatted = getFormattedMarks(marks, value, min, max, !!valueFormat)

    return Object.entries(marksFormatted).map(([key, label]) => ({
      value: parseFloat(key),
      label,
    }))
  }, [marks, max, min, value, valueFormat])

  const sliderClassNames = deepMergeStyles(
    {
      root: styles.mantineSliderRoot,
      track: styles.mantineSliderTrack,
      bar: styles.mantineSliderBar,
      thumb: styles.mantineSliderThumb,
      markWrapper: styles.mantineSliderMarkWrapper,
      mark: styles.mantineSliderMark,
      markLabel: styles.mantineSliderMarkLabel,
      label: styles.mantineSliderLabel,
    },
    userClassNames,
  )

  return (
    <div className={classNames(styles.slider, className)}>
      {!!label && (
        <div className={styles.labelWrapper}>
          <p className={classNames(styles.labelText, labelClassName)}>{label}</p>
          {tooltipText && <Tooltip label={tooltipText} />}
        </div>
      )}
      <MantineSlider
        value={value}
        onChange={onChange}
        marks={mantineMarks}
        classNames={sliderClassNames}
        label={valueFormat ? (v) => formatSliderLabel(valueFormat, v) : () => null}
        labelAlwaysOn={!!valueFormat}
        min={min}
        max={max}
        step={step}
        size="xs"
        disabled={disabled}
        {...rest}
      />
    </div>
  )
}
