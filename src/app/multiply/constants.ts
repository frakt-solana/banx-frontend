import { ReactNode } from 'react'

import { ADRASOL_PAIR, JLP_PAIR, LRTS_PAIR, VSOL_PAIR, WFRAGSOL_PAIR } from './[ticker]/constants'
import FLPImage from './assets/FLP.png'
import MeteoraImage from './assets/Meteora.png'

export type TokenItem = {
  logoUrl?: string
  ticker: string
  maxApr?: string
  maxMultiply?: number
  tvl?: number
  isComingSoon?: boolean
  customContent?: ReactNode
}

export const MOCK_TOKEN_ITEMS: TokenItem[] = [
  {
    logoUrl: FLPImage.src,
    ticker: 'FLP.1',
    maxMultiply: 100,
    isComingSoon: true,
  },
  {
    logoUrl: MeteoraImage.src,
    ticker: 'Meteora LP',
    maxMultiply: 100,
    isComingSoon: true,
  },
]

export interface StatEntry {
  label: string
  value?: string //? Static value
  dynamicValue?: (context: StatContext) => string
  tooltip?: string
}

export interface StatContext {
  maxMultiplier?: number
}

export const TOKEN_CONTENT_MAP: Record<string, StatEntry[]> = {
  [VSOL_PAIR.collateralTicker]: [
    {
      label: 'V points',
      dynamicValue: (context) => `${context.maxMultiplier}X`,
      tooltip:
        'Points can be earned by participating in select DeFi integrations, with more earning methods to come. In the future, these points will be redeemable for governance tokens, The Vaults combined governance and utility token.',
    },
  ],
  [WFRAGSOL_PAIR.collateralTicker]: [
    {
      label: 'Fragmetric points',
      dynamicValue: (context) => `${context.maxMultiplier}X`,
      tooltip:
        'When holding $fragmetric Asset, F Points are credited in real-time without the need for additional procedures',
    },
  ],
  [ADRASOL_PAIR.collateralTicker]: [
    { label: 'Adrastea points', dynamicValue: (context) => `${context.maxMultiplier}X` },
    { label: 'Sanctum points', dynamicValue: (context) => `${context.maxMultiplier}X` },
  ],
  [LRTS_PAIR.collateralTicker]: [
    { label: 'Adrastea points', dynamicValue: (context) => `${context.maxMultiplier}X` },
    { label: 'Solayer points', dynamicValue: (context) => `${context.maxMultiplier}X` },
  ],
  [JLP_PAIR.collateralTicker]: [{ label: 'APR', value: 'up to 200%' }],
  any: [{ label: 'SOL & USDC markets', value: 'GO LONG on anything' }],
}
