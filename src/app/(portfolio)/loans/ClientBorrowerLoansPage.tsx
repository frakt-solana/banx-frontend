'use client'

import { useEffect } from 'react'

import dynamic from 'next/dynamic'
import { create } from 'zustand'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { PATHS } from '@banx/constants'

import ActiveLoansSection from './ActiveLoansSection'

import styles from './ClientBorrowerLoansPage.module.scss'

const LoanListingsTable = dynamic(() => import('./LoanListingsSection'), { ssr: false })
const LoansHistorySection = dynamic(() => import('./LoansHistorySection'), { ssr: false })

enum TokenLoansTabName {
  LOANS = 'loans',
  LISTINGS = 'listings',
  HISTORY = 'history',
}

export const ClientBorrowerLoansPage = () => {
  const { tab: storeTab, setTab } = useTokenLoansTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: storeTab ?? TokenLoansTabName.LOANS,
  })

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
      {currentTabValue === TokenLoansTabName.LOANS && <ActiveLoansSection />}
      {currentTabValue === TokenLoansTabName.LISTINGS && <LoanListingsTable />}
      {currentTabValue === TokenLoansTabName.HISTORY && <LoansHistorySection />}
    </div>
  )
}

type LoansTokenTabsState = {
  tab: TokenLoansTabName | null
  setTab: (tab: TokenLoansTabName | null) => void
}

export const useTokenLoansTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))

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
