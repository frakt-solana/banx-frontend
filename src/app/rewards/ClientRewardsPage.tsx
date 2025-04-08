'use client'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { Plug } from './assets'
import EarnTab from './components/EarnTab'
import Header from './components/LeaderboardHeader'
import ReferralTab from './components/ReferralTab'
import RewardsTab from './components/RewardsTab'

import styles from './ClientRewardsPage.module.scss'

export enum TabName {
  Rewards = 'rewards',
  Leaderboard = 'leaderboard',
  Earn = 'earn',
  Referral = 'referral',
}

export const ClientRewardsPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LEADERBOARD_TABS,
    defaultValue: TabName.Referral,
  })

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Tabs value={currentTabValue} {...tabsProps} type="secondary" className={styles.tabs} />
      {currentTabValue === TabName.Referral && <ReferralTab />}
      {currentTabValue === TabName.Rewards && <RewardsTab />}
      {currentTabValue === TabName.Leaderboard && <LeaderboardPlug />}
      {currentTabValue === TabName.Earn && <EarnTab />}
    </div>
  )
}

const LeaderboardPlug = () => {
  return (
    <div className={styles.leaderboardPlug}>
      <Plug />
      <h4>Season 3 coming soon</h4>
    </div>
  )
}

export const LEADERBOARD_TABS: Tab[] = [
  {
    label: 'Referrals',
    value: TabName.Referral,
  },
  {
    label: 'BONK rewards',
    value: TabName.Rewards,
  },
  {
    label: 'Leaderboard',
    value: TabName.Leaderboard,
  },
  {
    label: 'Earn points',
    value: TabName.Earn,
  },
]
