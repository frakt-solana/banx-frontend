import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/navigation'

import { MARKET_OPTIONS_WITHOUT_ALL, TokenDropdown } from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { buildUrlWithModeAndToken } from '@banx/store'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLenderTokenActivityTable } from './hooks'

import styles from './LenderTokenActivityTable.module.scss'

const LenderTokenActivityTable = () => {
  const { connected } = useWallet()

  const { loans, loading, isNoLoans, tokenType, setTokenType, sortViewParams, loadMore } =
    useLenderTokenActivityTable()

  const columns = getTableColumns()

  if (!connected) return <EmptyList message={MESSAGES.NOT_CONNECTED_ACTIVITY} />

  const customJSX = (
    <TokenDropdown
      option={tokenType}
      options={MARKET_OPTIONS_WITHOUT_ALL}
      onChange={setTokenType}
    />
  )

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.table}
        loadMore={loadMore}
        loading={loading}
        emptyMessage={isNoLoans ? <NoLoans /> : undefined}
        customJSX={customJSX}
        showCard
      />
      {!isEmpty(loans) && !loading && <Summary />}
    </div>
  )
}

export default LenderTokenActivityTable

const NoLoans = () => {
  const router = useRouter()

  const goToLendPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND, null))
  }

  return (
    <EmptyList
      message={MESSAGES.NO_LENDING_ACTIVITY}
      buttonProps={{ text: 'Lend', onClick: goToLendPage }}
    />
  )
}
