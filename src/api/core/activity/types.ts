import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { RequestWithPagination } from '@banx/api/base'

import { BorrowerActivitySchema, LenderActivitySchema } from './schemas'

//? ========= Data types =========
export type LenderActivity = z.infer<typeof LenderActivitySchema>
export type BorrowerActivity = z.infer<typeof BorrowerActivitySchema>

//? ========= API function types =========
export type FetchLenderActivity = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
    collection?: string[]
    sortBy: string
    state?: string
  }>,
) => Promise<LenderActivity[]>

export type FetchBorrowerActivity = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
    collection?: string[]
    sortBy: string
    state?: string
  }>,
) => Promise<BorrowerActivity[]>
