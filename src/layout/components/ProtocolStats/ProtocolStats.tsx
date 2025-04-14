import { Skeleton } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { createDisplayValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { stats } from '@banx/api/common'
import { formatCompact, formatNumbersWithCommas } from '@banx/utils/common'
import { getTokenDecimals } from '@banx/utils/tokens'

import styles from './ProtocolStats.module.scss'

export const ProtocolStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['allTotalStats'],
    queryFn: () => stats.fetchAllTotalStats('allInUsdc'),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  if (isLoading || !data) {
    return <Skeleton classNames={{ root: styles.skeletonProtocolStats }} />
  }

  if (!data) return null

  const { totalValueLocked, nftLoansTvl, splLoansTvl, activeLoans, loansVolumeAllTime } = data

  const tokenDecimals = getTokenDecimals(LendingTokenType.Usdc)

  const createDisplayValue = (value: number) => {
    return createDisplayValueJSX(formatCompact((value / 10 ** tokenDecimals).toString()), '$')
  }

  const tooltipContent = (
    <div className={styles.protocolAdditionalStats}>
      <div className={styles.protocolAdditionalStat}>
        <span>Total debt</span>
        <span>{createDisplayValue(nftLoansTvl + splLoansTvl)}</span>
      </div>

      <div className={styles.protocolAdditionalStat}>
        <span>Active loans</span>
        <span>{formatNumbersWithCommas(activeLoans)}</span>
      </div>
      <div className={styles.protocolAdditionalStat}>
        <span>All time volume</span>
        <span>{createDisplayValue(loansVolumeAllTime)}</span>
      </div>
    </div>
  )

  return (
    <Tooltip label={tooltipContent}>
      <div className={styles.protocolStats}>
        <span className={styles.protocolStatsLabel}>TVL:</span>
        <span className={styles.protocolStatsValue}>{createDisplayValue(totalValueLocked)}</span>
      </div>
    </Tooltip>
  )
}
