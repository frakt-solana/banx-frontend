import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/navigation'

import { MARKET_OPTIONS_WITHOUT_ALL, TokenDropdown } from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { MESSAGES, PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'

import { Summary } from './components/Summary'
import { getTableColumns } from './components/columns'
import { useOffersHistoryView } from './hooks'

import styles from './OffersHistorySection.module.scss'

const OffersHistorySection = () => {
  const { connected } = useWallet()

  const { loans, loading, isNoLoans, tokenType, setTokenType, sortViewParams, loadMore } =
    useOffersHistoryView()

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

export default OffersHistorySection

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
