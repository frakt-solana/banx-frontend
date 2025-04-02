import { z } from 'zod'

import { BondTradeTransactionSchema, FraktBondSchema, OfferSchema } from './schemas'

type ResponsePaginationMeta = {
  skip: number
  limit: number
  totalCount: number
}
export type ResponseWithPagination<T> = {
  data: T
  meta: ResponsePaginationMeta
}

type RequestPaginationParams = {
  order?: 'desc' | 'asc'
  skip?: number
  limit?: number
  getAll?: boolean
}

export type RequestWithPagination<T> = T & RequestPaginationParams

export type MutationResponse = {
  message?: string
  success: boolean
}

export type FraktBond = z.infer<typeof FraktBondSchema>
export type BondTradeTransaction = z.infer<typeof BondTradeTransactionSchema>

//? Same as BondOfferV3
export type Offer = z.infer<typeof OfferSchema>
