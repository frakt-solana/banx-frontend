'use client'

import { FC, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'
import { useParams } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createDisplayValueJSX } from '@banx/components/TableComponents'
import { Tabs, useTabs } from '@banx/components/Tabs'

import { VaultPreview } from '@banx/api/tokens'
import { PATHS } from '@banx/constants'
import { formatCompact, getTokenDecimals, getTokenUnit } from '@banx/utils'

import { TOOLTIP_TEXTS } from '../constants'
import { useVaultsPreview } from '../hooks'
import { DepositOverviewSwitcher } from './components'
import { ManageVault } from './components/ManageVault/ManageVault'
import VaultAbout from './components/VaultAbout'
import VaultActivity from './components/VaultActivity'
import VaultAllocation from './components/VaultAllocation'
import VaultPerformance from './components/VaultPerformance'
import { useLiquidityPoolTxns } from './hooks'

import styles from './ClientLendVaultsPage.module.scss'

export const ClientLendVaultsPage = () => {
  const { vaultPubkey = '' } = useParams<{ vaultPubkey: string }>()
  const { vaultsPreview } = useVaultsPreview()

  const vaultPreview = useMemo(() => {
    return vaultsPreview.find((preview) => preview.vaultPubkey === vaultPubkey)
  }, [vaultsPreview, vaultPubkey])

  const [activeView, setActiveView] = useState<'activity' | 'performance'>('activity')

  const toggleActiveView = () => {
    setActiveView((prev) => (prev === 'activity' ? 'performance' : 'activity'))
  }

  const vaultViewContent = useMemo(() => {
    if (!vaultPreview) return null
    const { lenderWalletPubkey: walletPubkey, lendingToken } = vaultPreview

    const views = {
      activity: <VaultActivity walletPubkey={walletPubkey} lendingToken={lendingToken} />,
      performance: <VaultPerformance walletPubkey={walletPubkey} lendingToken={lendingToken} />,
    }
    return views[activeView]
  }, [activeView, vaultPreview])

  if (!vaultPreview) return null

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[
          { title: 'Lend', path: PATHS.LEND },
          { title: 'Vaults', path: PATHS.LEND_VAULTS },
          { title: vaultPreview.vaultName },
        ]}
        onboardContentType="vaults"
      />
      <div className={styles.pageContent}>
        <div className={styles.statsPanel}>
          <MainStats vaultPreview={vaultPreview} />
          <UserStats vaultPreview={vaultPreview} />
        </div>

        <div className={styles.contentPanels}>
          <div className={styles.vaultViewPanel}>
            <DepositOverviewSwitcher value={activeView} onClick={toggleActiveView} />
            {vaultViewContent}
          </div>
          <ManageVault vaultPreview={vaultPreview} />
        </div>

        <VaultTabsContent vaultPreview={vaultPreview} />
      </div>
    </div>
  )
}

const MainStats: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { currentApy, targetApy, maxCapacity, totalDepositedAmount, lendingToken } = vaultPreview

  const formattedMaxCapacity = formatCompact(
    (maxCapacity / 10 ** getTokenDecimals(lendingToken)).toString(),
  )

  const displayMaxCapacity = createDisplayValueJSX(formattedMaxCapacity, getTokenUnit(lendingToken))

  const classNamesProps = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.mainStats}>
      <StatInfo
        label="TVL / Capacity"
        value={
          <>
            <DisplayValue value={totalDepositedAmount} strictTokenType={lendingToken} />
            {' / '}
            {displayMaxCapacity}
          </>
        }
        classNamesProps={classNamesProps}
        tooltipText={TOOLTIP_TEXTS.TVL}
      />
      <StatInfo
        label="Current apy"
        value={currentApy / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesProps}
        tooltipText={TOOLTIP_TEXTS.CURRENT_APY}
      />
      <StatInfo
        label="Target apy"
        value={targetApy / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesProps}
        tooltipText={TOOLTIP_TEXTS.TARGET_APY}
      />
    </div>
  )
}

const UserStats: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { pendingClaimAmount, userTotalDepositedAmount, lendingToken } = vaultPreview
  const { claim } = useLiquidityPoolTxns(vaultPreview)

  const isClaimButtonDisabled = !pendingClaimAmount

  return (
    <div className={styles.userStats}>
      <div className={styles.depositUserStat}>
        <span className={styles.userStatLabel}>My deposit</span>
        <DisplayValue value={userTotalDepositedAmount} strictTokenType={lendingToken} />
      </div>

      <div className={styles.userStatSeparator} />

      <div className={styles.withdrawUserStat}>
        <span className={styles.userStatLabel}>Earnings</span>
        <Button
          size="medium"
          onClick={() => claim(new BN(pendingClaimAmount))}
          disabled={isClaimButtonDisabled}
        >
          {isClaimButtonDisabled ? 'Nothing to claim' : 'Claim'}
          {!isClaimButtonDisabled && (
            <DisplayValue value={pendingClaimAmount} strictTokenType={lendingToken} />
          )}
        </Button>
      </div>
    </div>
  )
}

const VaultTabsContent: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.Allocation,
  })

  return (
    <div className={styles.vaultTabsContent}>
      <Tabs value={currentTabValue} {...tabsProps} className={styles.vaultTabs} type="secondary" />
      {currentTabValue === TabName.About && <VaultAbout vaultPreview={vaultPreview} />}
      {currentTabValue === TabName.Allocation && (
        <VaultAllocation
          assetsAllocation={vaultPreview.assetsAllocation}
          lendingToken={vaultPreview.lendingToken}
        />
      )}
    </div>
  )
}

enum TabName {
  About = 'about',
  Allocation = 'allocation',
}

const TABS = [
  {
    label: 'Allocation',
    value: TabName.Allocation,
  },
  {
    label: 'About',
    value: TabName.About,
  },
]
