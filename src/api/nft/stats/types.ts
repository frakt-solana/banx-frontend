import { z } from 'zod'

import { AllTotalStatsSchema, UserLoansStatsSchema, UserOffersStatsSchema } from './schemas'

export type UserOffersStats = z.infer<typeof UserOffersStatsSchema>

export type UserOffersStatsResponse = {
  data: UserOffersStats
}

export type UserLoansStats = z.infer<typeof UserLoansStatsSchema>

export type UserLoansStatsResponse = {
  data: UserLoansStats
}

export type AllTotalStats = z.infer<typeof AllTotalStatsSchema>

export enum AssetType {
  NFT = 'nft',
  SPL = 'spl',
}
