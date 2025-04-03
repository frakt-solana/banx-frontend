import { FC } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { core } from '@banx/api/tokens'

import { getTableColumns } from './columns'

import styles from './OrderBook.module.scss'

interface OrderBookProps {
  offers: BondOfferV3[]
  loan: core.TokenLoan
  isLoading: boolean
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
}

const OrderBook: FC<OrderBookProps> = ({ loan, offers, isLoading, refinance }) => {
  const columns = getTableColumns({ refinance, loan })

  const showEmptyList = !offers.length && !isLoading

  return (
    <div className={styles.orderbook}>
      <Table
        data={offers}
        columns={columns}
        className={styles.table}
        classNameTableWrapper={classNames(styles.tableWrapper, {
          [styles.emptyWrapper]: showEmptyList,
        })}
        loading={isLoading}
        loaderClassName={styles.loader}
        emptyMessage={
          showEmptyList ? (
            <EmptyList message="No offers available for this loan right now. Check back later!" />
          ) : undefined
        }
      />
    </div>
  )
}

export default OrderBook
