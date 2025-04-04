import { BN } from 'fbonds-core'
import {
  LendingTokenType,
  UserVault as UserEscrowFromSdk,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { ResponseWithPagination } from '@banx/api/shared'

import {
  BorrowOfferSchemaRaw,
  CollateralTokenSchema,
  DBOfferSchema,
  MultiplyMarketDataSchema,
  TokenLoanAuctionsAndListingsSchema,
  TokenLoanSchema,
  TokenMarketPreviewSchema,
  TokenMetaSchema,
  TokenOfferPreviewSchema,
  VaultPreviewSchema,
} from './schemas'

export type TokenMeta = z.infer<typeof TokenMetaSchema>

export type TokenLoan = z.infer<typeof TokenLoanSchema>

export type TokenMarketPreview = z.infer<typeof TokenMarketPreviewSchema>
export type TokenMarketPreviewResponse = ResponseWithPagination<TokenMarketPreview>

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>

export type TokenLoanAuctionsAndListings = z.infer<typeof TokenLoanAuctionsAndListingsSchema>
export type TokenLoanAuctionsAndListingsResponse =
  ResponseWithPagination<TokenLoanAuctionsAndListings>

type BaseCollateralToken = z.infer<typeof CollateralTokenSchema>
export type CollateralToken = Omit<BaseCollateralToken, 'amountInWallet'> & {
  amountInWallet: BN
}

export type DBOffer = z.infer<typeof DBOfferSchema>
export type BorrowOfferRaw = z.infer<typeof BorrowOfferSchemaRaw>

export enum MarketCategory {
  All = 'All',
  LST = 'LST',
  DeFi = 'DeFi',
  Meme = 'Meme',
  Governance = 'Governance',
  RWA = 'RWA',
  LP = 'LP',
  DePin = 'DePin',
  Gaming = 'Gaming',
}

interface RewardProgram {
  name: string
  rewardRate: string
  details: string
}

export interface MarketTokenRewards {
  lendingTokenType: LendingTokenType
  description: string
  rewardPrograms: Array<RewardProgram>
}

export type MarketTokenRewardsResponse = Record<string, MarketTokenRewards>

export type VaultPreview = z.infer<typeof VaultPreviewSchema>
export type MultiplyMarketData = z.infer<typeof MultiplyMarketDataSchema>

export type UserEscrow = UserEscrowFromSdk
