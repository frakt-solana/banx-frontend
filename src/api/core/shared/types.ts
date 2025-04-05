import { z } from 'zod'

import { CollateralTokenSchema, TokenMetaSchema } from './schemas'

export type TokenMeta = z.infer<typeof TokenMetaSchema>
export type CollateralToken = z.infer<typeof CollateralTokenSchema>
