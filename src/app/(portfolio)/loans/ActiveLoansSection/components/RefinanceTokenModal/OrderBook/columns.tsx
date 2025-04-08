import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { ColumnType } from '@banx/components/Table'
import { HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api'
import { bnToNumberSafe } from '@banx/utils/bn'
import { insertAtArray } from '@banx/utils/common'

import { ActionCell, AprCell, BorrowCell, DebtCell } from './cells'

import styles from './OrderBook.module.scss'

type GetTableColumns = (props: {
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
  loan: Loan
}) => ColumnType<BondOfferV3>[]

export const getTableColumns: GetTableColumns = ({ refinance, loan }) => {
  const isOracleMarket = loan.collateral.oraclePriceFeedType !== 'none'

  const columns: ColumnType<BondOfferV3>[] = [
    {
      key: 'borrow',
      title: <HeaderCell label="Borrowed" align="left" />,
      render: (offer) => <BorrowCell loan={loan} offer={offer} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (offer) => <AprCell offer={offer} loan={loan} />,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (offer) => <DebtCell loan={loan} offer={offer} />,
    },
    {
      key: 'action',
      render: (offer) => <ActionCell loan={loan} offer={offer} refinance={refinance} />,
    },
  ]

  if (isOracleMarket) {
    const column = {
      key: 'liqLtv',
      title: <HeaderCell label="Liq. LTV" />,
      render: (offer: BondOfferV3) => (
        <span className={styles.cellValue}>
          {createPercentValueJSX(bnToNumberSafe(offer.liquidationLtvBp) / 100)}
        </span>
      ),
    }

    return insertAtArray(columns, 2, column)
  }

  return columns
}
