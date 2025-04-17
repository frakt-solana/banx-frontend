import _ from 'lodash'

// shorten the checksummed version of the input address to have 4 characters at start and end
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address?.slice(0, chars)}...${address?.slice(-chars)}`
}

export const copyToClipboard = (value: string): void => {
  navigator.clipboard.writeText(value)
}

export const pasteFromClipboard = async (): Promise<string> => {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (err) {
    console.error('Error reading from clipboard:', err)
    return ''
  }
}
export const formatNumbersWithCommas = (value: number | string) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const formatCompact = (value: string, maximumFractionDigits = 1) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(parseFloat(value))
}

export const createDownloadLink = (data: string, filename: string, type?: string) => {
  const blobType = type || 'text/csv'
  const blob = new Blob([data], { type: blobType })
  const blobURL = window.URL.createObjectURL(blob)

  const tempLink = document.createElement('a')
  tempLink.href = blobURL
  tempLink.download = filename
  tempLink.click()

  window.URL.revokeObjectURL(blobURL)
}

/**
 * Removes unnecessary trailing zeros from a decimal number string.
 * If the number ends with a decimal point after removing zeros, the point is also removed.
 *
 * @example
 * formatTrailingZeros("123.4500") // Returns "123.45"
 * formatTrailingZeros("123.0000") // Returns "123"
 * formatTrailingZeros("123.")     // Returns "123"
 */
export const formatTrailingZeros = (value: string) =>
  value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')

export const limitDecimalPlaces = (inputValue: string, decimalPlaces = 3) => {
  const regex = new RegExp(`^-?\\d*(\\.\\d{0,${decimalPlaces}})?`)
  const match = inputValue.match(regex)
  return match ? formatTrailingZeros(match[0]) : ''
}

/**
 *
 * @param apy The APY as a percentage (e.g., 5 for 5% APR).
 * @param compoundingPeriods The number of compounding periods per year (e.g., 12 for monthly compounding).
 * @returns The APR as a percentage (e.g., 5.12 for 5.12% APR).
 */
export const convertApyToApr = (apy: number, compoundingPeriods = 1) => {
  const apyDecimal = apy / 100
  const aprDecimal = compoundingPeriods * (Math.pow(1 + apyDecimal, 1 / compoundingPeriods) - 1)
  return aprDecimal * 100
}

export const isExponentialNotation = (n: number) => {
  const numStr = n.toString()
  return numStr.includes('e') || numStr.includes('E')
}

export const convertToDecimalString = (n: number, precision = 0) => {
  if (!isExponentialNotation(n)) return n.toString()

  const powOfE = _.flowRight(Math.abs, Math.floor, Math.log10, Math.abs)(n)
  return n.toFixed(powOfE + precision)
}

export const insertAtArray = <T>(arr: T[], index: number, element: T): T[] => {
  return [...arr.slice(0, index), element, ...arr.slice(index)]
}

export const deepMergeStyles = <T extends string>(
  base: Partial<Record<T, string>>,
  override?: Partial<Record<T, string>>,
): Partial<Record<T, string>> => {
  return _.mergeWith({}, base, override, (objValue, srcValue) => {
    if (objValue && srcValue) {
      return `${objValue} ${srcValue}`
    }
    return objValue || srcValue
  })
}

export const parseLabel = (label: string): { protocol?: string; ticker: string } => {
  //? Try to extract protocol name from the label, e.g. "(RateX)" => "RateX"
  const protocolMatch = label.match(/\(([^)]+)\)/)
  const protocol = protocolMatch?.[1]

  //? Remove the protocol part from the label, e.g. "PT-JTO-2508 (RateX)" => "PT-JTO-2508"
  const labelWithoutProtocol = label.replace(/\s*\([^)]+\)/, '')

  //? Remove trailing date-like suffix, e.g. "-2508" => ""
  const ticker = labelWithoutProtocol.replace(/-\d{4}$/, '')

  return {
    protocol, //? optional, only present if "(...)" was in the label
    ticker, //? cleaned-up ticker without protocol and date
  }
}
