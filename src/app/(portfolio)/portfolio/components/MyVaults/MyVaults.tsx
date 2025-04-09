import { FC } from 'react'

import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { Button } from '@banx/components/Buttons'

import { UserPortfolio } from '@banx/api/common'
import { PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useTokenType } from '@banx/store/common'

import { Header, StatsSection, VaultsList } from './components'

import styles from './MyVaults.module.scss'

interface MyVaultsProps {
  vaults: UserPortfolio['vaults'] | undefined
  isLoading: boolean
}

const MyVaults: FC<MyVaultsProps> = ({ vaults, isLoading }) => {
  const { stats, list } = vaults ?? {}
  const { netPnl = 0, apy = 0, funds = 0, totalPnl = 0 } = stats ?? {}

  const router = useRouter()
  const { tokenType } = useTokenType()

  const goToVaultsPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND_VAULTS, tokenType))
  }

  const actionButtonProps = {
    onClick: goToVaultsPage,
    text: _.isEmpty(list) ? 'Invest in vaults' : 'Manage my vaults',
  }

  return (
    <div className={styles.container}>
      <Header totalPnl={totalPnl} />
      <StatsSection netPnl={netPnl} apy={apy} funds={funds} />
      <VaultsList vaults={list} totalFunds={funds} isLoading={isLoading} />
      <Button onClick={actionButtonProps.onClick} className={styles.manageButton}>
        {actionButtonProps.text}
      </Button>
    </div>
  )
}

export default MyVaults
