import { FC, JSX } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import _ from 'lodash'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip, { TooltipWrapper } from '@banx/components/Tooltip'

import { UserPortfolio } from '@banx/api/common'

import styles from './MyVaults.module.scss'

type UserVaults = UserPortfolio['vaults']
type VaultList = UserVaults['list']

type Vault = VaultList[number]
type AssetMeta = Vault['assets'][number]

export const Header: FC<{ totalPnl: number }> = ({ totalPnl }) => (
  <div className={styles.header}>
    <h4 className={styles.title}>My vaults</h4>
    <TooltipWrapper title={<TooltipContent totalPnl={totalPnl} />}>
      <Button variant="secondary" size="small">
        History
      </Button>
    </TooltipWrapper>
  </div>
)

const TooltipContent: FC<{ totalPnl: number }> = ({ totalPnl }) => (
  <StatInfo
    label="Total pnl"
    value={formatNetPnl(totalPnl)}
    classNamesProps={{
      container: styles.tooltipStat,
      label: styles.tooltipStatLabel,
      value: classNames(styles.tooltipStatValue, getNetPnlClassName(totalPnl)),
    }}
  />
)

interface StatsSectionProps {
  netPnl: number
  apy: number
  funds: number
}

export const StatsSection: FC<StatsSectionProps> = ({ netPnl, apy, funds }) => {
  const statClassNames = {
    container: styles.stat,
    label: styles.statLabel,
    value: styles.statValue,
  }

  return (
    <div className={styles.statsContainer}>
      <StatInfo
        label="Current pnl"
        value={formatNetPnl(netPnl)}
        classNamesProps={{ ...statClassNames, value: getNetPnlClassName(netPnl) }}
        tooltipText="Net profit or loss of all vaults"
      />
      <StatInfo
        label="Avg APY"
        value={apy / 100}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Average annual interest rate of all vaults"
      />
      <StatInfo
        label="Total funds"
        value={<DisplayValue value={funds} />}
        classNamesProps={{ ...statClassNames, container: styles.alignRight }}
      />
    </div>
  )
}

interface PositionsListProps {
  vaults: Vault[] | undefined
  totalFunds: number
  isLoading: boolean
}

export const VaultsList: FC<PositionsListProps> = ({ vaults, totalFunds, isLoading }) => {
  const { connected } = useWallet()

  const sortedVaults = _.sortBy(vaults ?? [], (vault) => vault.funds).reverse()

  if (!connected)
    return (
      <div className={styles.listContainer}>
        <EmptyList message="Connect wallet to see your vaults" className={styles.emptyList} />
      </div>
    )

  return (
    <div className={styles.listContainer}>
      {isLoading && <Loader size="small" className={styles.loader} />}
      {!isLoading && _.isEmpty(vaults) && (
        <EmptyList message="No vaults here for now" className={styles.emptyList} />
      )}
      {!isLoading && !_.isEmpty(vaults) && (
        <ul className={styles.list}>
          {sortedVaults.map((vault) => (
            <VaultListItem key={vault.name} vault={vault} totalFunds={totalFunds} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface VaultListItemProps {
  vault: Vault
  totalFunds: number
}

const VaultListItem: FC<VaultListItemProps> = ({ vault, totalFunds }) => {
  const { name, funds = 0, assets } = vault
  const percentage = totalFunds ? (funds / totalFunds) * 100 : 0

  return (
    <li className={styles.listItem}>
      <div className={styles.listItemInfo}>
        <span className={styles.listItemLabel}>{name}</span>
        <AssetsLogos assets={assets} />
      </div>
      <div className={styles.listItemBar} style={{ width: `${percentage}%` }} />
      <span className={styles.listItemValue}>
        <DisplayValue value={funds} />
      </span>
    </li>
  )
}

const VISIBLE_ASSETS_LIMIT = 3
const AssetsLogos: FC<{ assets: AssetMeta[] }> = ({ assets }) => {
  const visibleAssets = assets.slice(0, VISIBLE_ASSETS_LIMIT)
  const hiddenAssets = assets.slice(VISIBLE_ASSETS_LIMIT)

  return (
    <div className={styles.assetsLogosContainer}>
      {visibleAssets.map((asset) => (
        <Tooltip key={asset.name} title={<VisibleAssetTooltip asset={asset} />}>
          <ResponsiveImage
            src={asset.logoUrl}
            alt={asset.name}
            className={classNames(styles.assetLogo, {
              [styles.stackedLogo]: visibleAssets.length > 1,
            })}
          />
        </Tooltip>
      ))}

      {hiddenAssets.length > 0 && (
        <Tooltip title={<HiddenAssetsTooltip assets={hiddenAssets} />}>
          <div className={styles.extraAssetsCount}>+{hiddenAssets.length}</div>
        </Tooltip>
      )}
    </div>
  )
}

const VisibleAssetTooltip: FC<{ asset: AssetMeta }> = ({ asset }) => (
  <span className={styles.assetTooltipTicker}>{asset.name}</span>
)

const HiddenAssetsTooltip: FC<{ assets: AssetMeta[] }> = ({ assets }) => (
  <div className={styles.assetsTooltipContent}>
    {assets.map((asset) => (
      <div key={asset.name} className={styles.assetTooltipItem}>
        <ResponsiveImage src={asset.logoUrl} className={styles.assetTooltipLogo} />
        <span className={styles.assetTooltipTicker}>{asset.name}</span>
      </div>
    ))}
  </div>
)

const getNetPnlClassName = (netPnl: number): string =>
  classNames(styles.pnlStat, {
    [styles.positive]: netPnl > 0,
    [styles.negative]: netPnl < 0,
  })

const formatNetPnl = (netPnl: number): JSX.Element => {
  if (netPnl === 0) return <DisplayValue value={netPnl} />

  const sign = netPnl > 0 ? '+' : '-'

  return (
    <>
      {sign}
      <DisplayValue value={Math.abs(netPnl)} />
    </>
  )
}
