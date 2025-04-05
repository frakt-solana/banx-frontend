import { z } from 'zod'

import {
  BorrowOfferSchemaRaw,
  OfferSchema,
  OfferSchemaStr,
  TokenOfferPreviewSchema,
} from './schemas'

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>

export type Offer = z.infer<typeof OfferSchema>
export type OfferStr = z.infer<typeof OfferSchemaStr>

export type BorrowOfferRaw = z.infer<typeof BorrowOfferSchemaRaw>
