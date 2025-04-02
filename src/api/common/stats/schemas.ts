import { z } from 'zod'

export const UserOffersStatsSchema = z.object({
  loansVolume: z.number(),
  offersVolume: z.number(),
  earned: z.number(),
  totalOffers: z.number(),
  totalLent: z.number(),
  totalInterest: z.number(),
  weightedApr: z.number(),
  totalReceived: z.number(),
  paidInterest: z.number(),
  pendingInterest: z.number(),
  claimedLstYield: z.number(),
})

export const UserLoansStatsSchema = z.object({
  loans: z.number(),
  totalBorrowed: z.number(),
  totalLoans: z.number(),
  totalDebt: z.number(),
  totalRepaid: z.number(),
})

export const AllTotalStatsSchema = z.object({
  dailyVolume: z.number(),
  activeLoans: z.number(),
  totalValueLocked: z.number(),
  loansVolumeAllTime: z.number(),
  splLoansTvl: z.number(),
  nftLoansTvl: z.number(),
})
