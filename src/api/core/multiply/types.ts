import { z } from 'zod'

import { MultiplyMarketDataSchema } from './schemas'

export type MultiplyMarketData = z.infer<typeof MultiplyMarketDataSchema>
