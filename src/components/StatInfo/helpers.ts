import { JSX } from 'react'

import _ from 'lodash'

import { VALUES_TYPES } from './constants'

export const formatValue = (value: number | string | JSX.Element, type: VALUES_TYPES) => {
  if (!_.isString(value) && !_.isNumber(value)) {
    return value
  }

  if (type === VALUES_TYPES.PERCENT) {
    const formattedValue = _.isNumber(value) ? value?.toFixed(0) : value
    return formattedValue
  }

  return value
}
