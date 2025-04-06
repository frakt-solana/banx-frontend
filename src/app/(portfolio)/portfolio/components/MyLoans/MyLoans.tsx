import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { UserPortfolio } from '@banx/api/common'

import { Header, LoansChartStats, ResponsiveChart, StatsSection } from './components'
import { useMyLoans } from './hooks'

import styles from './MyLoans.module.scss'

interface MyLoansProps {
  loans: UserPortfolio['loans'] | undefined
}

const MyLoans: FC<MyLoansProps> = ({ loans }) => {
  const { totalBorrowed = 0, totalDebt = 0, totalWeeklyFee = 0 } = loans ?? {}
  const { loansData, chartData, buttonProps } = useMyLoans(loans)

  return (
    <div className={styles.container}>
      <Header title="My loans" />
      <div className={styles.content}>
        <div className={styles.chartSection}>
          <StatsSection
            totalDebt={totalDebt}
            totalBorrowed={totalBorrowed}
            totalWeeklyFee={totalWeeklyFee}
          />
          <ResponsiveChart className={styles.mobileChart} chartData={chartData} />
          <LoansChartStats loansData={loansData} />
        </div>
        <ResponsiveChart className={styles.desktopChart} chartData={chartData} />
      </div>

      <Button {...buttonProps} className={styles.actionButton}>
        {buttonProps.text}
      </Button>
    </div>
  )
}

export default MyLoans
