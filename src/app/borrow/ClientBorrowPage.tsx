'use client'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Tabs, useTabs } from '@banx/components/Tabs'

import InstantBorrowContent from './InstantBorrowContent/InstantBorrowContent'
import ListLoansContent from './ListLoansContent/ListLoansContent'

import styles from './ClientBorrowPage.module.scss'

export const ClientBorrowPage = () => {
  const {
    value: currentTabValue,
    setValue,
    tabs,
  } = useTabs({ tabs: TABS, defaultValue: TabName.INSTANT })

  const faqType = currentTabValue === TabName.INSTANT ? 'borrow' : 'listing'

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'How it works?' }]}
        onboardContentType="borrow"
        faqType={faqType}
      />
      <Tabs value={currentTabValue} tabs={tabs} setValue={setValue} type="secondary" />
      {currentTabValue === TabName.INSTANT && <InstantBorrowContent />}
      {currentTabValue === TabName.REQUEST && <ListLoansContent />}
    </div>
  )
}

enum TabName {
  INSTANT = 'instant',
  REQUEST = 'request',
}

const TABS = [
  {
    label: 'Borrow now',
    value: TabName.INSTANT,
  },
  {
    label: 'List loans',
    value: TabName.REQUEST,
  },
]
