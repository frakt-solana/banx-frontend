'use client'

import { TokenSwitcher } from '@banx/components/TokenSwitcher'

import MyLoans from './components/MyLoans'
import MyOffers from './components/MyOffers'
import MyPositions from './components/MyPositions'
import MyVaults from './components/MyVaults'
import { useUserPortfolio } from './hooks'

import styles from './ClientPortfolioPage.module.scss'

export const ClientPortfolioPage = () => {
  const { data, isLoading } = useUserPortfolio()
  const { positions, loans, offers, vaults } = data ?? {}

  return (
    <div className={styles.pageWrapper}>
      <TokenSwitcher />
      <div className={styles.content}>
        <MyPositions positions={positions} isLoading={isLoading} />
        <MyVaults vaults={vaults} isLoading={isLoading} />
        <MyLoans loans={loans} />
        <MyOffers offers={offers} />
      </div>
    </div>
  )
}
