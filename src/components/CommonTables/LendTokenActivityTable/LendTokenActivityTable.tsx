import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { MESSAGES } from '@banx/constants/messages'

import { getTableColumns } from './columns'
import { FilterTableSection } from './components'
import { useLendTokenActivity } from './hooks'

import styles from './LendTokenActivityTable.module.scss'

interface LendTokenActivityTableProps {
  marketPubkey: string
  className?: string
}

const LendTokenActivityTable: FC<LendTokenActivityTableProps> = ({ marketPubkey, className }) => {
  const {
    loans,
    isLoading,
    fetchNextPage,
    hasNextPage,
    filterParams,
    showEmptyList,
    isRadioButtonDisabled,
    isToggleDisabled,
  } = useLendTokenActivity(marketPubkey)

  const { connected } = useWallet()

  const columns = getTableColumns()

  return (
    <>
      <FilterTableSection
        {...filterParams}
        isRadioButtonDisabled={isRadioButtonDisabled}
        isToggleDisabled={isToggleDisabled}
      />
      <Table
        data={loans}
        columns={columns}
        className={styles.tableRoot}
        loading={isLoading}
        loadMore={hasNextPage ? fetchNextPage : undefined}
        loaderSize="small"
        classNameTableWrapper={classNames(styles.tableWrapper, className, {
          [styles.notConnectedContent]: !connected,
        })}
        emptyMessage={
          showEmptyList ? <EmptyList message={MESSAGES.NO_LENDING_ACTIVITY} /> : undefined
        }
      />
    </>
  )
}

export default LendTokenActivityTable
