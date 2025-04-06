import { every, map } from 'lodash'
import { useRouter } from 'next/navigation'

import { DoughnutChartProps } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { UserPortfolio } from '@banx/api/common'
import { PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useTokenType } from '@banx/store/common'

import {
  DEFAULT_NO_DATA_CHART,
  LOAN_STATUS_COLORS,
  LOAN_STATUS_DISPLAY_NAMES,
  LoanStatus,
} from './constants'

import styles from './MyLoans.module.scss'

export const useMyLoans = (loans: UserPortfolio['loans'] | undefined) => {
  const { activeCount = 0, terminatingCount = 0, liquidationCount = 0 } = loans ?? {}
  const totalLoans = activeCount + terminatingCount + liquidationCount

  const router = useRouter()
  const { tokenType } = useTokenType()

  //? Map loans status to values
  const loansData = createLoansData(activeCount, terminatingCount, liquidationCount)
  const loansValues = loansData.map((loan) => loan.value)
  const hasNoLoans = isAllZero(loansValues)

  //? Chart configuration
  const chartData: DoughnutChartProps = createChartData(loansValues, totalLoans)

  const goToBorrowPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.BORROW, tokenType))
  }

  const goToLoansPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LOANS, tokenType))
  }

  const buttonProps = {
    onClick: hasNoLoans ? goToBorrowPage : goToLoansPage,
    text: hasNoLoans ? 'Borrow' : 'Manage my loans',
  }

  return { loansData, buttonProps, chartData }
}

const createLoansData = (
  activeCount: number,
  terminatingCount: number,
  liquidationCount: number,
) => {
  const loansStatusToValueMap = {
    [LoanStatus.Active]: activeCount,
    [LoanStatus.Terminating]: terminatingCount,
    [LoanStatus.Liquidation]: liquidationCount,
  }

  return map(loansStatusToValueMap, (value, key) => ({
    label: LOAN_STATUS_DISPLAY_NAMES[key as LoanStatus],
    key: key as LoanStatus,
    value,
  }))
}

const createChartData = (values: number[], totalLoans: number): DoughnutChartProps => ({
  data: isAllZero(values) ? DEFAULT_NO_DATA_CHART.value : values,
  colors: isAllZero(values) ? DEFAULT_NO_DATA_CHART.colors : Object.values(LOAN_STATUS_COLORS),
  className: styles.doughnutChart,
  statInfoProps: {
    label: 'Loans',
    value: totalLoans,
    valueType: VALUES_TYPES.STRING,
  },
})

const isAllZero = (values: number[]) => every(values, (value) => value === 0)
