import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { DoughnutChartProps } from '@banx/components/Charts'
import { DisplayValue } from '@banx/components/TableComponents'

import { UserPortfolio } from '@banx/api/common'
import { PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useTokenType } from '@banx/store/common'
import { getTokenDecimals } from '@banx/utils/tokens'

import {
  ALLOCATION_STATUS_COLORS,
  ALLOCATION_STATUS_DISPLAY_NAMES,
  AllocationStatus,
  DEFAULT_NO_DATA_CHART,
} from './constants'

import styles from './MyOffers.module.scss'

export const useOffersAllocation = (offers: UserPortfolio['offers'] | undefined) => {
  const { active = 0, underwater = 0, escrow = 0, terminating = 0 } = offers ?? {}
  const totalFunds = escrow + active + underwater + terminating

  const router = useRouter()
  const { tokenType } = useTokenType()

  const allocationData = createAllocationsData(escrow, active, underwater, terminating)
  const allocationValues = _.map(
    allocationData,
    ({ value }) => value / 10 ** getTokenDecimals(tokenType),
  )
  const hasNoAllocation = _.every(allocationValues, (value) => value === 0)

  //? Chart configuration
  const chartData: DoughnutChartProps = createChartData(allocationValues, totalFunds)

  const goToLendPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND, tokenType))
  }

  const goToOffersPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.OFFERS, tokenType))
  }

  const buttonProps = {
    onClick: hasNoAllocation ? goToLendPage : goToOffersPage,
    text: hasNoAllocation ? 'Lend' : 'Manage my offers',
  }

  return {
    allocationData,
    chartData,
    buttonProps,
  }
}

const createAllocationsData = (
  escrow: number,
  active: number,
  underwater: number,
  terminating: number,
) => {
  const allocationStatusToValueMap = {
    [AllocationStatus.Vault]: escrow,
    [AllocationStatus.Active]: active,
    [AllocationStatus.Underwater]: underwater,
    [AllocationStatus.Terminating]: terminating,
  }

  return _.map(allocationStatusToValueMap, (value, status) => ({
    label: ALLOCATION_STATUS_DISPLAY_NAMES[status as AllocationStatus],
    key: status,
    value,
  }))
}

const createChartData = (values: number[], totalFunds: number): DoughnutChartProps => ({
  data: isAllZero(values) ? DEFAULT_NO_DATA_CHART.value : values,
  colors: isAllZero(values)
    ? DEFAULT_NO_DATA_CHART.colors
    : Object.values(ALLOCATION_STATUS_COLORS),
  statInfoProps: {
    label: 'Funds',
    value: <DisplayValue value={totalFunds} />,
  },
  className: styles.doughnutChart,
})

const isAllZero = (values: number[]) => _.every(values, (value) => value === 0)
