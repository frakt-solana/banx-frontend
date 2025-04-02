import { z } from 'zod'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  OfferSchema,
  ResponseWithPagination,
} from '../../shared'

export type FraktBond = z.infer<typeof FraktBondSchema>

export type BondTradeTransaction = z.infer<typeof BondTradeTransactionSchema>

//? Same as BondOfferV3
export type Offer = z.infer<typeof OfferSchema>

export type FetchMarketOffersResponse = ResponseWithPagination<Offer[]>
