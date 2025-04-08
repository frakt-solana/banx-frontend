import { QuoteGetRequest, createJupiterApiClient } from '@jup-ag/api'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { getTokenDecimals } from '@banx/utils/tokens'

export type CustomQuoteParams = Partial<Omit<QuoteGetRequest, 'amount' | 'slippageBps'>>

export const DEFAULT_JUP_QUOTE_PARAMS: CustomQuoteParams = {
  // computeAutoSlippage: true,
  asLegacyTransaction: false,
  // minimizeSlippage: false,
  onlyDirectRoutes: true,
} as const

type FetchConversionRate = {
  pair: MultiplyPair
  mode: 'leverage' | 'sellToRepay'
  tokenDecimals: number
  amount?: number //? amount of collateral for leverage mode | amount of lendingToken for sellToRepay mode
  slippageBps: number
}
export const fetchConversionRate = async ({
  pair,
  mode,
  tokenDecimals,
  amount,
  slippageBps = 300,
}: FetchConversionRate): Promise<number> => {
  try {
    const { marketTokenType } = pair
    const isLeverageSwap = mode === 'leverage'

    const lendingTokenDecimals = getTokenDecimals(marketTokenType)
    const lendingTokenMint = marketTokenType === LendingTokenType.Usdc ? USDC_ADDRESS : WSOL_ADDRESS

    const decimalsDiff = tokenDecimals - lendingTokenDecimals

    const customQuoteParams = isLeverageSwap
      ? pair.customLeverageQuoteParams
      : pair.customSellToRepayQuoteParams

    const jupiterQuoteApi = createJupiterApiClient()
    try {
      const inputMint = isLeverageSwap ? lendingTokenMint : pair.collateralMint.toBase58()
      const outputMint = isLeverageSwap ? pair.collateralMint.toBase58() : lendingTokenMint

      const defaultSwapAmount = isLeverageSwap ? 10 ** lendingTokenDecimals : 10 ** tokenDecimals
      const swapAmount = amount || defaultSwapAmount

      const exactOutQuote = await jupiterQuoteApi.quoteGet({
        inputMint,
        outputMint,
        amount: swapAmount,
        slippageBps,
        swapMode: 'ExactOut',
        ...DEFAULT_JUP_QUOTE_PARAMS,
        ...customQuoteParams?.exactOut,
      })

      if (isLeverageSwap) {
        return (
          parseInt(exactOutQuote.outAmount) / parseInt(exactOutQuote.inAmount) / 10 ** decimalsDiff
        )
      } else {
        return (
          parseInt(exactOutQuote.inAmount) / parseInt(exactOutQuote.outAmount) / 10 ** decimalsDiff
        )
      }
    } catch {
      //? Cannot use collateral token as input mint for sellToRepay, because we need conversionRate to convert debt(amount) in usdc/sol into collateral
      const inputMint = lendingTokenMint
      const outputMint = pair.collateralMint.toBase58()

      const defaultSwapAmount = 10 ** lendingTokenDecimals

      const swapAmount = amount || defaultSwapAmount

      const exactInQuote = await jupiterQuoteApi.quoteGet({
        inputMint,
        outputMint,
        amount: swapAmount,
        slippageBps,
        swapMode: 'ExactIn',
        ...DEFAULT_JUP_QUOTE_PARAMS,
        ...customQuoteParams?.exactIn,
      })

      return parseInt(exactInQuote.outAmount) / parseInt(exactInQuote.inAmount) / 10 ** decimalsDiff
    }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch token price')
  }
}
