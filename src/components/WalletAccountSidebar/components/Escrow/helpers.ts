import { BN } from 'fbonds-core'
import { BANX_SOL_STAKING_YEILD_APR } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateBanxSolStakingRewards,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { UserEscrow } from '@banx/api'
import { ClusterStats } from '@banx/api/common'
import { getTokenDecimals, getTokenTicker } from '@banx/utils'

import { TabName } from './hooks'

type GetUserEscrowInfoParams = {
  userEscrow: UserEscrow | undefined
  clusterStats: ClusterStats | undefined
}

export const getUserEscrowInfo = ({ userEscrow, clusterStats }: GetUserEscrowInfoParams) => {
  const { slot = 0, epochStartedAt = 0 } = clusterStats || {}

  const offerLiquidityAmount = userEscrow ? userEscrow.offerLiquidityAmount.toNumber() : 0

  const repaymentsAmount = userEscrow ? userEscrow.repaymentsAmount.toNumber() : 0
  const interestRewardsAmount = userEscrow ? userEscrow.interestRewardsAmount.toNumber() : 0
  const rentRewards = userEscrow ? userEscrow.rentRewards.toNumber() : 0
  const totalLstYield =
    userEscrow && userEscrow.lendingTokenType === LendingTokenType.BanxSol
      ? calculateLstYield({ userEscrow, slot, epochStartedAt }).toNumber()
      : 0

  const totalClaimAmount = repaymentsAmount + interestRewardsAmount + rentRewards + totalLstYield

  const totalLiquidityValue = userEscrow
    ? userEscrow.offerLiquidityAmount.toNumber() + totalClaimAmount
    : 0

  const banxSolYieldInCurrentEpoch = userEscrow
    ? calculateYieldInCurrentEpoch(userEscrow, clusterStats)
    : 0
  const banxSolYieldInNextEpoch = userEscrow
    ? calculateYieldInNextEpoch(userEscrow, clusterStats)
    : 0

  return {
    offerLiquidityAmount,

    repaymentsAmount,
    interestRewardsAmount,
    rentRewards,
    totalLstYield,

    totalClaimAmount,

    totalLiquidityValue,

    banxSolYieldInCurrentEpoch,
    banxSolYieldInNextEpoch,
  }
}

type CalculateLstYield = (props: {
  userEscrow: UserEscrow
  slot: number
  epochStartedAt: number
}) => BN
export const calculateLstYield: CalculateLstYield = ({ userEscrow, slot, epochStartedAt }) => {
  const totalYield = calculateBanxSolStakingRewards({
    userVault: userEscrow,
    nowSlot: new BN(slot),
    currentEpochStartAt: new BN(epochStartedAt),
  })

  return totalYield
}

export const calculateYieldInCurrentEpoch = (
  userEscrow: UserEscrow,
  clusterStats: ClusterStats | undefined,
) => {
  const {
    epochApproxTimeRemaining = 0,
    epochStartedAt = 0,
    epoch = 0,
    slotsInEpoch = 0,
  } = clusterStats || {}

  const epochWhenOfferChanged = userEscrow.lastCalculatedSlot.toNumber() / slotsInEpoch

  const loanValue =
    epochWhenOfferChanged < epoch
      ? userEscrow.fundsInCurrentEpoch.add(userEscrow.fundsInNextEpoch).toNumber()
      : userEscrow.fundsInCurrentEpoch.toNumber()

  const currentTimeInUnix = moment().unix()
  const epochEndedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: epochStartedAt,
    currentTime: epochEndedAt,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}

export const calculateYieldInNextEpoch = (
  userEscrow: UserEscrow,
  clusterStats: ClusterStats | undefined,
) => {
  const { epochApproxTimeRemaining = 0, epochDuration = 0 } = clusterStats || {}

  const currentTimeInUnix = moment().unix()
  const epochStartedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue: userEscrow.fundsInCurrentEpoch.add(userEscrow.fundsInNextEpoch).toNumber(),
    startTime: epochStartedAt,
    currentTime: epochStartedAt + epochDuration,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}

interface GetInputErrorMessageProps {
  inputValue: string

  walletBalance: number
  escrowBalance: number

  activeTab: TabName
  tokenType: LendingTokenType
}
export const getInputErrorMessage = ({
  inputValue,
  walletBalance,
  escrowBalance,
  activeTab,
  tokenType,
}: GetInputErrorMessageProps) => {
  const marketTokenDecimals = getTokenDecimals(tokenType)

  const inputValueToNumber = parseFloat(inputValue)

  const isEmptyInputValue = isNaN(inputValueToNumber)
  const isWalletBalanceInsufficient = inputValueToNumber > walletBalance / 10 ** marketTokenDecimals
  const isEscrowBalanceInsufficient = inputValueToNumber > escrowBalance / 10 ** marketTokenDecimals

  const errorConditions: Array<[boolean, string]> = [
    [isEmptyInputValue, 'Please enter a value'],
    [
      isWalletBalanceInsufficient && activeTab === TabName.Wallet,
      createInsufficientWalletBalanceMessage(tokenType),
    ],
    [
      isEscrowBalanceInsufficient && activeTab === TabName.Escrow,
      createInsufficientEscrowBalanceMessage(tokenType),
    ],
  ]

  const errorMessage = errorConditions.find(([condition]) => condition)?.[1] ?? ''
  return errorMessage
}

const createInsufficientWalletBalanceMessage = (tokenType: LendingTokenType) =>
  `Not enough ${getTokenTicker(tokenType)} in wallet`

const createInsufficientEscrowBalanceMessage = (tokenType: LendingTokenType) =>
  `Not enough ${getTokenTicker(tokenType)} in escrow`
