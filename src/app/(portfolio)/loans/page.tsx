'use client'

import { useEffect } from 'react'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { PATHS } from '@banx/constants'

import BorrowerTokenActivityTable from './BorrowerActivityTable'
import LoanListingsTable from './LoanListingsTable'
import LoansContent from './LoansContent'
import { useTokenLoansTabs } from './hooks'

import styles from './page.module.scss'

const TokenLoansPage = () => {
  //? Used to set default tab when user is redirected to TokenLoansPage.
  const { tab: storeTab, setTab } = useTokenLoansTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: storeTab ?? TokenLoansTabName.LOANS,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Portfolio', path: PATHS.PORTFOLIO }, { title: 'My loans' }]}
        onboardContentType="loans"
      />
      <Tabs value={currentTabValue} {...tabsProps} type="secondary" />
      {currentTabValue === TokenLoansTabName.LOANS && <LoansContent />}
      {currentTabValue === TokenLoansTabName.LISTINGS && <LoanListingsTable />}
      {currentTabValue === TokenLoansTabName.HISTORY && <BorrowerTokenActivityTable />}
    </div>
  )
}

export default TokenLoansPage

export enum TokenLoansTabName {
  LOANS = 'loans',
  LISTINGS = 'listings',
  HISTORY = 'history',
}

const LOANS_TABS: Tab[] = [
  {
    label: 'Loans',
    value: TokenLoansTabName.LOANS,
  },
  {
    label: 'Listings',
    value: TokenLoansTabName.LISTINGS,
  },
  {
    label: 'History',
    value: TokenLoansTabName.HISTORY,
  },
]
