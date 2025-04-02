export const getDigitsAmount = (n: number) => {
  return n === 0 ? 1 : Math.floor(Math.log10(Math.abs(n))) + 1
}

/**
 * @param {number} n
 * @returns nearest integer value round by maximum digit.
 * F.e. 500 => 500, 345 => 300, 789 => 800, -789 => -800
 */
export const roundByMaxDigit = (n: number) => {
  const digitsAmount = getDigitsAmount(n)

  const denominator = 10 ** (digitsAmount - 1)

  return Math.round(n / denominator) * denominator
}

/**
 * Ensures that "-0.00", "-0.0", and similar cases return "0".
 */
export const toFixedNoNegativeZero = (num: number, fractionDigits = 0) => {
  const fixed = num.toFixed(fractionDigits)
  return parseFloat(fixed) === 0 ? '0' : fixed
}
