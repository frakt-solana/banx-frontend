import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut, DoughnutChartProps } from '@banx/components/Charts'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Tooltip } from '@banx/components/Tooltip'

import { UserPortfolio } from '@banx/api/common'

import { ChartStat } from '..'
import { ALLOCATION_STATUS_COLORS, AllocationStatus } from './constants'

import styles from './MyOffers.module.scss'

export const Header: FC<{ offers: UserPortfolio['offers'] | undefined }> = ({ offers }) => (
  <div className={styles.allocationHeader}>
    <h4 className={styles.heading}>My offers</h4>
    <Tooltip label={<TooltipContent data={offers?.historical} />} overlayClassName={styles.tooltip}>
      <Button variant="secondary" size="small">
        History
      </Button>
    </Tooltip>
  </div>
)

const TooltipContent: FC<{ data: UserPortfolio['offers']['historical'] | undefined }> = ({
  data,
}) => {
  const {
    totalLent = 0,
    pendingInterest = 0,
    totalInterestEarned = 0,
    totalDefaulted = 0,
    totalDefaultedCount = 0,
    totalWeightedApy = 0,
  } = data || {}

  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatTooltipLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.mainTooltipStats}>
        <StatInfo
          label="Total lent"
          classNamesProps={mainStatClassNames}
          value={<DisplayValue value={totalLent} />}
        />
        <div className={styles.separateLine} />
        <div className={styles.additionalTooltipStats}>
          <StatInfo
            label="Pending interest"
            value={<DisplayValue value={pendingInterest} />}
            flexType="row"
          />
          <StatInfo
            label="Earned interest"
            value={<DisplayValue value={totalInterestEarned} />}
            flexType="row"
          />
        </div>
      </div>

      <StatInfo
        label="Defaulted"
        value={
          <>
            {<DisplayValue value={totalDefaulted} />} ({totalDefaultedCount} loans)
          </>
        }
        flexType="row"
      />
      <StatInfo
        label="Weighted apr"
        value={totalWeightedApy / 100}
        flexType="row"
        valueType={VALUES_TYPES.PERCENT}
      />
    </div>
  )
}

interface StatsSectionProps {
  weeklyInterest: number
  weightedApy: number
}

export const StatsSection: FC<StatsSectionProps> = ({ weeklyInterest, weightedApy }) => {
  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.allocationStats}>
      <StatInfo
        label="Weekly interest"
        value={<DisplayValue value={weeklyInterest} />}
        tooltipText="Extrapolated weekly interest based off your current active loans"
        classNamesProps={mainStatClassNames}
      />
      <StatInfo
        label="Weighted apr"
        value={weightedApy / 100}
        tooltipText="Average annual interest rate of your current active loans"
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={mainStatClassNames}
      />
    </div>
  )
}

export const ResponsiveChart: FC<{ className: string; chartData: DoughnutChartProps }> = ({
  className,
  chartData,
}) => (
  <div className={className}>
    <Doughnut {...chartData} />
  </div>
)

export const AllocationChartStats: FC<{
  allocationData: Array<{ key: string; value: number; label: string }>
}> = ({ allocationData }) => (
  <div className={styles.allocationChartStats}>
    {allocationData.map(({ key, label, value }) => (
      <ChartStat
        key={key}
        label={label}
        value={<DisplayValue value={value} />}
        indicatorColor={ALLOCATION_STATUS_COLORS[key as AllocationStatus]}
      />
    ))}
  </div>
)
