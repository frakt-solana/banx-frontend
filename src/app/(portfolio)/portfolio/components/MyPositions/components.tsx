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
import { Tooltip } from '@banx/components/Tooltip'

import { UserPortfolio } from '@banx/api/common'

import styles from './MyPositions.module.scss'

type UserPositions = UserPortfolio['positions']
type PositionList = UserPositions['list']
type Position = PositionList[number]

export const Header: FC<{ totalNetPnl: number }> = ({ totalNetPnl }) => (
  <div className={styles.header}>
    <h4 className={styles.title}>My multiplies</h4>
    <Tooltip label={<TooltipContent totalNetPnl={totalNetPnl} />}>
      <Button variant="secondary" size="small">
        History
      </Button>
    </Tooltip>
  </div>
)

const TooltipContent: FC<{ totalNetPnl: number }> = ({ totalNetPnl }) => (
  <StatInfo
    label="Total pnl"
    value={formatNetPnl(totalNetPnl)}
    classNamesProps={{
      container: styles.tooltipStat,
      label: styles.tooltipStatLabel,
      value: classNames(styles.tooltipStatValue, getNetPnlClassName(totalNetPnl)),
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
  positions: Position[] | undefined
  totalFunds: number
  isLoading: boolean
}

export const PositionsList: FC<PositionsListProps> = ({ positions, totalFunds, isLoading }) => {
  const { connected } = useWallet()

  const sortedPositions = _.sortBy(positions ?? [], (position) => position.funds).reverse()

  if (!connected)
    return (
      <div className={styles.listContainer}>
        <EmptyList message="Connect wallet to see your positions" className={styles.emptyList} />
      </div>
    )

  return (
    <div className={styles.listContainer}>
      {isLoading && <Loader size="small" className={styles.loader} />}
      {!isLoading && _.isEmpty(positions) && (
        <EmptyList message="No multiplier positions available yet" className={styles.emptyList} />
      )}
      {!isLoading && !_.isEmpty(positions) && (
        <ul className={styles.list}>
          {sortedPositions.map((position) => (
            <PositionListItem key={position.name} position={position} totalFunds={totalFunds} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface PositionListItemProps {
  position: Position
  totalFunds: number
}

const PositionListItem: FC<PositionListItemProps> = ({ position, totalFunds }) => {
  const { name, funds = 0, logoUrl } = position ?? {}
  const percentage = totalFunds ? (funds / totalFunds) * 100 : 0

  return (
    <li className={styles.listItem}>
      <div className={styles.listItemInfo}>
        <span className={styles.listItemLabel}>{name}</span>
        <ResponsiveImage src={logoUrl} className={styles.listItemImage} />
      </div>
      <div className={styles.listItemBar} style={{ width: `${percentage}%` }} />
      <span className={styles.listItemValue}>
        <DisplayValue value={funds} />
      </span>
    </li>
  )
}

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
