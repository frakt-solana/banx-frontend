import { z } from 'zod'

import {
  BorrowOfferSchemaRaw,
  DBOfferSchema,
  OfferDBSchema,
  OfferSchema,
  TokenOfferPreviewSchema,
} from './schemas'

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>

export type Offer = z.infer<typeof OfferSchema>
export type OfferDB = z.infer<typeof OfferDBSchema>

export type BorrowOfferRaw = z.infer<typeof BorrowOfferSchemaRaw>

export type DBOffer = z.infer<typeof DBOfferSchema>
