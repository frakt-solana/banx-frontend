import { z } from 'zod'

export const MultiplyMarketDataSchema = z.object({
  maxMultiplier: z.number(),
  maxNetApr: z.number(),
  collateralApr: z.number(),
})
