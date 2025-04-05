'use client'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { PATHS } from '@banx/constants'

import ActiveOffersSection from './components/ActiveOffersSection'
import LenderLoansSection from './components/LenderLoansSection'
import OffersHistorySection from './components/OffersHistorySection'

import styles from './ClientLenderOffersPage.module.scss'

export const ClientLenderOffersPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: TabName.Offers,
  })

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Portfolio', path: PATHS.PORTFOLIO }, { title: 'My offers' }]}
        onboardContentType="offers"
      />
      <Tabs value={currentTabValue} {...tabsProps} type="secondary" />
      {currentTabValue === TabName.Offers && <ActiveOffersSection />}
      {currentTabValue === TabName.Loans && <LenderLoansSection />}
      {currentTabValue === TabName.History && <OffersHistorySection />}
    </div>
  )
}

enum TabName {
  Offers = 'offers',
  Loans = 'loans',
  History = 'history',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: TabName.Offers,
  },
  {
    label: 'Loans',
    value: TabName.Loans,
  },
  {
    label: 'History',
    value: TabName.History,
  },
]
