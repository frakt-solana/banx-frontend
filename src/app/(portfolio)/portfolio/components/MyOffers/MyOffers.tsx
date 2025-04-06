import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { UserPortfolio } from '@banx/api/common'

import { AllocationChartStats, Header, ResponsiveChart, StatsSection } from './components'
import { useOffersAllocation } from './hooks'

import styles from './MyOffers.module.scss'

interface MyOffersProps {
  offers: UserPortfolio['offers'] | undefined
}

const MyOffers: FC<MyOffersProps> = ({ offers }) => {
  const { weeklyInterest = 0, weightedApy = 0 } = offers ?? {}
  const { allocationData, chartData, buttonProps } = useOffersAllocation(offers)

  return (
    <div className={styles.allocationContainer}>
      <Header offers={offers} />
      <div className={styles.allocationContent}>
        <div className={styles.allocationStatsContainer}>
          <StatsSection weeklyInterest={weeklyInterest} weightedApy={weightedApy} />
          <ResponsiveChart className={styles.mobileChart} chartData={chartData} />
          <AllocationChartStats allocationData={allocationData} />
        </div>
        <ResponsiveChart className={styles.desktopChart} chartData={chartData} />
      </div>
      <Button onClick={buttonProps.onClick} className={styles.actionButton}>
        {buttonProps.text}
      </Button>
    </div>
  )
}

export default MyOffers
