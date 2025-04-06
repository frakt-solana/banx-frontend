import { FC } from 'react'

import { Doughnut, DoughnutChartProps } from '@banx/components/Charts'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { ChartStat } from '..'
import { LOAN_STATUS_COLORS, LoanStatus } from './constants'

import styles from './MyLoans.module.scss'

export const Header: FC<{ title: string }> = ({ title }) => (
  <h4 className={styles.heading}>{title}</h4>
)

export const ResponsiveChart: FC<{ className: string; chartData: DoughnutChartProps }> = ({
  className,
  chartData,
}) => (
  <div className={className}>
    <Doughnut {...chartData} />
  </div>
)

export const LoansChartStats: FC<{
  loansData: Array<{ key: LoanStatus; value: number; label: string }>
}> = ({ loansData }) => (
  <div className={styles.loansChartStats}>
    {loansData.map(({ key, ...props }) => (
      <ChartStat key={key} indicatorColor={LOAN_STATUS_COLORS[key]} {...props} />
    ))}
  </div>
)

interface StatsSectionProps {
  totalDebt: number
  totalBorrowed: number
  totalWeeklyFee: number
}

export const StatsSection: FC<StatsSectionProps> = ({
  totalDebt,
  totalBorrowed,
  totalWeeklyFee,
}) => {
  const debtStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.statsContainer}>
      <StatInfo
        label="Total debt"
        value={<DisplayValue value={totalDebt} />}
        classNamesProps={debtStatClassNames}
      />
      <div className={styles.separateLine} />
      <div className={styles.additionalStats}>
        <StatInfo
          label="Total borrowed"
          value={<DisplayValue value={totalBorrowed} />}
          flexType="row"
        />
        <StatInfo
          label="Weekly fee"
          value={<DisplayValue value={totalWeeklyFee} />}
          flexType="row"
        />
      </div>
    </div>
  )
}
