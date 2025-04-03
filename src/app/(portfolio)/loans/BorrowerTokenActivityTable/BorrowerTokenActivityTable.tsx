import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/navigation'

import { MARKET_OPTIONS_WITHOUT_ALL, TokenDropdown } from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { buildUrlWithModeAndToken } from '@banx/store'
import { ViewState, useTableView } from '@banx/store/common'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useBorrowerTokenActivityTable } from './hooks'

import styles from './BorrowerTokenActivityTable.module.scss'

const BorrowerTokenActivityTable = () => {
  const { connected } = useWallet()
  const { viewState } = useTableView()

  const { loans, loading, isNoLoans, tokenType, setTokenType, sortViewParams, loadMore } =
    useBorrowerTokenActivityTable()

  const columns = getTableColumns({ isCardView: viewState === ViewState.CARD })

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
        loadMore={loadMore}
        className={styles.table}
        loading={loading}
        customJSX={customJSX}
        emptyMessage={isNoLoans ? <NoLoans /> : undefined}
        showCard
      />
      {!isEmpty(loans) && !loading && <Summary />}
    </div>
  )
}

export default BorrowerTokenActivityTable

const NoLoans = () => {
  const router = useRouter()

  const goToBorrowPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.BORROW, null))
  }

  return (
    <EmptyList
      message={MESSAGES.NO_BORROWING_ACTIVITY}
      buttonProps={{ text: 'Borrow', onClick: goToBorrowPage }}
    />
  )
}
