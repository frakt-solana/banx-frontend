'use client'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { PATHS } from '@banx/constants'

import LenderTokenActivityTable from './components/LenderTokenActivityTable'
import LenderTokenLoansContent from './components/LenderTokenLoansContent'
import OffersTokenTabContent from './components/OffersTokenTabContent'

import styles from './ClientLenderOffersPage.module.scss'

export const ClientLenderOffersPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: OffersTabName.OFFERS,
  })

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Portfolio', path: PATHS.PORTFOLIO }, { title: 'My offers' }]}
        onboardContentType="offers"
      />
      <Tabs value={currentTabValue} {...tabsProps} type="secondary" />
      {currentTabValue === OffersTabName.OFFERS && <OffersTokenTabContent />}
      {currentTabValue === OffersTabName.LOANS && <LenderTokenLoansContent />}
      {currentTabValue === OffersTabName.HISTORY && <LenderTokenActivityTable />}
    </div>
  )
}

enum OffersTabName {
  OFFERS = 'offers',
  LOANS = 'loans',
  HISTORY = 'history',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: OffersTabName.OFFERS,
  },
  {
    label: 'Loans',
    value: OffersTabName.LOANS,
  },
  {
    label: 'History',
    value: OffersTabName.HISTORY,
  },
]
