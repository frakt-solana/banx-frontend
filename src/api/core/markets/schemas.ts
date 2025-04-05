import { OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { zStringToInt } from '@banx/api/zodSchemas'
import { MarketCategory } from '@banx/constants'

import { TokenMetaSchema } from '../shared'

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: zStringToInt,

  collectionName: z.string(),

  offersTvl: z.number(),
  loansTvl: z.number(),

  activeOffersAmount: z.number(),
  activeLoansAmount: z.number(),

  bestOffer: z.number(),
  marketApr: z.number(),

  marketCategory: z.array(z.string().or(z.nativeEnum(MarketCategory))),
  oraclePriceFeedType: z.nativeEnum(OraclePriceFeedType),
  isHot: z.boolean(),
})
