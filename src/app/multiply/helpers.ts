import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { TokenMarketPreview } from '@banx/api'
import { roundByMaxDigit } from '@banx/utils/numbers'
import { getTokenDecimals } from '@banx/utils/tokens'

export const formatMaxApr = (maxNetApr: number | undefined): string | undefined => {
  if (!maxNetApr) return undefined

  const needsRounding = maxNetApr > 100
  return needsRounding ? roundByMaxDigit(maxNetApr).toString() : maxNetApr.toFixed()
}

export const convertToUsdcTvl = (market: TokenMarketPreview | undefined): number => {
  if (!market) return 0

  const loansTvl = market.loansTvl ?? 0
  const priceUsd = market.collateral?.priceUsd ?? 0

  const decimalsDiff =
    getTokenDecimals(LendingTokenType.BanxSol) - getTokenDecimals(LendingTokenType.Usdc)

  const normalizedTvl = loansTvl * priceUsd
  return normalizedTvl / 10 ** decimalsDiff
}
