import { z } from 'zod'

export const SeasonUserRewardsSchema = z.object({
  totalClaimed: z.number(),
  availableToClaim: z.number(),
  playerPoints: z.number(),
  loyalty: z.number(), //? F.e 1 => 0 percentage, 2 => 100 percentage
  earlyIncentives: z.number(),
  firstSeasonRewards: z.number(),
  secondSeasonRewards: z.number(),
  totalParticipants: z.number(),
  bonkRewards: z
    .object({
      totalAccumulated: z.number(),
      available: z.number(),
      redeemed: z.number(),
    })
    .optional(),
  banxRewards: z
    .object({
      totalAccumulated: z.number(),
      available: z.number(),
      redeemed: z.number(),
    })
    .optional(),
})

export const RefPersonalDataSchema = z.object({
  user: z.string(),
  refCode: z.string(),
  referredBy: z.string(),
  refUsers: z.string().array(),
})

export const LeaderboardDataSchema = z.object({
  rank: z.number(),
  avatar: z.string().nullable(),
  user: z.string(),
  points: z.number(),
})

export const BonkWithdrawalSchema = z.object({
  requestId: z.string(),
  rawTransaction: z.number().array(),
})

export const LoanStatsSchema = z.object({
  totalBorrowed: z.number(),
  totalDebt: z.number(),
  totalWeeklyFee: z.number(),
  activeCount: z.number(),
  terminatingCount: z.number(),
  liquidationCount: z.number(),
})

export const OfferStatsSchema = z.object({
  escrow: z.number(),
  active: z.number(),
  underwater: z.number(),
  terminating: z.number(),
  weeklyInterest: z.number(),
  weightedApy: z.number(),
  historical: z.object({
    totalLent: z.number(),
    pendingInterest: z.number(),
    totalInterestEarned: z.number(),
    totalDefaultedCount: z.number(),
    totalDefaulted: z.number(),
    totalWeightedApy: z.number(),
  }),
})

const AssetMetaSchema = z.object({
  name: z.string(),
  logoUrl: z.string(),
  funds: z.number(),
})

const VaultsListSchema = z.array(
  z.object({
    name: z.string(),
    funds: z.number(),
    assets: z.array(
      z.object({
        name: z.string(),
        logoUrl: z.string(),
      }),
    ),
  }),
)

const VaultStatsSchema = z.object({
  netPnl: z.number(),
  apy: z.number(),
  funds: z.number(),
  totalPnl: z.number(),
})

const PositionStatsSchema = z.object({
  netPnl: z.number(),
  apy: z.number(),
  funds: z.number(),
  totalNetPnl: z.number(),
})

export const UserPortfolioSchema = z.object({
  loans: LoanStatsSchema,
  offers: OfferStatsSchema,
  vaults: z.object({
    stats: VaultStatsSchema,
    list: VaultsListSchema,
  }),
  positions: z.object({
    stats: PositionStatsSchema,
    list: AssetMetaSchema.array(),
  }),
})
