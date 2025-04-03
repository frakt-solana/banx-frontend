import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'

import { MARKET_OPTIONS, TokenDropdown } from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import { Search } from '@banx/components/Search'
import Table from '@banx/components/Table'

import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { buildUrlWithModeAndToken } from '@banx/store'
import { ViewState, useTableView } from '@banx/store/common'

import { getTableColumns } from './columns'
import { useTokenLoanListingsContent } from './hooks/useTokenLoanListingsContent'

import styles from './TokenLoanListingsTable.module.scss'

const TokenLoanListingsTable = () => {
  const { connected } = useWallet()
  const { viewState } = useTableView()

  const {
    loans,
    loading,
    isNoLoans,
    filteredListEmptyMessage,
    sortViewParams,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
  } = useTokenLoanListingsContent()

  const columns = getTableColumns({ isCardView: viewState === ViewState.CARD })

  const customJSX = (
    <>
      <TokenDropdown
        option={selectedLendingToken}
        options={MARKET_OPTIONS}
        onChange={handleSelectedTokenChange}
      />
      <Search value={searchQuery} onChange={setSearchQuery} />
    </>
  )

  if (!connected) return <EmptyList message={MESSAGES.NO_CONNECTED_LOANS} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        className={styles.table}
        loading={loading}
        sortViewParams={sortViewParams}
        customJSX={customJSX}
        emptyMessage={isNoLoans ? <NoListings /> : <EmptyList message={filteredListEmptyMessage} />}
        showCard
      />
    </div>
  )
}

export default TokenLoanListingsTable

const NoListings = () => {
  const router = useRouter()

  const goToBorrowPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.BORROW, null))
  }

  return (
    <EmptyList
      message={MESSAGES.BORROWER_NO_LISTINGS}
      buttonProps={{ text: 'List', onClick: goToBorrowPage }}
    />
  )
}
