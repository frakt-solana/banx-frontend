import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useSearchParams } from 'next/navigation'

import { TICKER_TO_TOKEN, TOKEN_TICKER } from '@banx/utils'

export const buildUrlWithModeAndToken = (
  pathname: string,
  tokenType: LendingTokenType | null,
): string => {
  const urlParams = new URLSearchParams()

  if (tokenType) {
    urlParams.set('token', TOKEN_TICKER[tokenType])
  }

  return `${pathname}?${urlParams.toString()}`
}

const getUrlParam = (
  params: URLSearchParams | ReturnType<typeof useSearchParams>,
  key: string,
): string | null => {
  return typeof params.get === 'function' ? params.get(key) : null
}

export const getTokenTypeFromUrl = (params: URLSearchParams): LendingTokenType => {
  const tokenTicker = getUrlParam(params, 'token')

  if (tokenTicker && TICKER_TO_TOKEN[tokenTicker]) {
    return TICKER_TO_TOKEN[tokenTicker]
  }
  return LendingTokenType.Usdc
}
