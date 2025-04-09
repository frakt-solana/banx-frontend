import { FC } from 'react'

import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { Button } from '@banx/components/Buttons'

import { UserPortfolio } from '@banx/api/common'
import { PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useTokenType } from '@banx/store/common'

import { Header, PositionsList, StatsSection } from './components'

import styles from './MyPositions.module.scss'

interface MyPositionsProps {
  positions: UserPortfolio['positions'] | undefined
  isLoading: boolean
}

const MyPositions: FC<MyPositionsProps> = ({ positions, isLoading }) => {
  const { stats, list } = positions ?? {}
  const { netPnl = 0, apy = 0, funds = 0, totalNetPnl = 0 } = stats ?? {}

  const router = useRouter()
  const { tokenType } = useTokenType()

  const goToLeveragePage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEVERAGE_BASE, tokenType))
  }

  const goToPositionsPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.POSITIONS, tokenType))
  }

  const actionButtonProps = {
    onClick: _.isEmpty(list) ? goToLeveragePage : goToPositionsPage,
    text: _.isEmpty(list) ? 'Start leveraging assets' : 'Manage my positions',
  }

  return (
    <div className={styles.container}>
      <Header totalNetPnl={totalNetPnl} />
      <StatsSection netPnl={netPnl} apy={apy} funds={funds} />
      <PositionsList positions={list} totalFunds={funds} isLoading={isLoading} />
      <Button onClick={actionButtonProps.onClick} className={styles.manageButton}>
        {actionButtonProps.text}
      </Button>
    </div>
  )
}

export default MyPositions
