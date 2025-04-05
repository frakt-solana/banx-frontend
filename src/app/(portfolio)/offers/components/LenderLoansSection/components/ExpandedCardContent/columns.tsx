import { OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
  getColorByPercent,
  getTokenLoanSupply,
  insertAtArray,
} from '@banx/utils'

import { TableColumnKey } from '../../constants'
import { SortColumnOption } from '../../hooks/useLenderLoansSorting'
import { TokenLoanOptimistic } from '../../hooks/useLenderLoansState'
import { ActionsCell, ClaimCell, LTVCell, StatusCell } from './tableCells'

import styles from './ExpandedCardContent.module.scss'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => TokenLoanOptimistic | null
  onRowClick: (loan: TokenLoan) => void
  onSelectAll: () => void
  hasSelectedLoans: boolean
  onSort: (value: SortColumnOption<TableColumnKey>) => void
  selectedSortOption: SortColumnOption<TableColumnKey>
  oraclePriceFeedType: OraclePriceFeedType
}

export const getTableColumns = ({
  findLoanInSelection,
  onRowClick,
  onSelectAll,
  hasSelectedLoans,
  onSort,
  selectedSortOption,
  oraclePriceFeedType,
}: GetTableColumnsProps) => {
  const isOracleMarket = oraclePriceFeedType !== 'none'

  const columns: ColumnType<TokenLoan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.checkboxCell}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" className={styles.headerCellText} />
        </div>
      ),
      render: (loan) => {
        return (
          <CollateralTokenCell
            amount={getTokenLoanSupply(loan)}
            onCheckboxClick={() => onRowClick(loan)}
            selected={!!findLoanInSelection(loan.publicKey)}
            collateralPrice={loan.collateralPrice}
            lendingToken={loan.bondTradeTransaction.lendingToken}
          />
        )
      },
    },
    {
      key: TableColumnKey.CLAIM,
      title: (
        <HeaderCell
          label="Claim"
          className={styles.headerCellText}
          columnKey={TableColumnKey.CLAIM}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <ClaimCell loan={loan} />,
    },
    {
      key: TableColumnKey.LTV,
      title: (
        <HeaderCell
          label="LTV"
          className={styles.headerCellText}
          columnKey={TableColumnKey.LTV}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: TableColumnKey.REPAID,
      title: (
        <HeaderCell
          label="Repaid"
          className={styles.headerCellText}
          columnKey={TableColumnKey.REPAID}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => (
        <HorizontalCell
          className={styles.bodyCellText}
          value={
            <DisplayValue
              value={loan.bondTradeTransaction.lenderFullRepaidAmount}
              strictTokenType={loan.bondTradeTransaction.lendingToken}
            />
          }
        />
      ),
    },
    {
      key: TableColumnKey.APR,
      title: (
        <HeaderCell
          label="APR"
          className={styles.headerCellText}
          columnKey={TableColumnKey.APR}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => (
        <HorizontalCell
          className={styles.bodyCellText}
          value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
          isHighlighted
        />
      ),
    },
    {
      key: TableColumnKey.STATUS,
      title: (
        <HeaderCell
          label="Status"
          className={styles.headerCellText}
          columnKey={TableColumnKey.STATUS}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      render: (loan) => <ActionsCell loan={loan} />,
    },
  ]

  if (isOracleMarket) {
    const column = {
      key: TableColumnKey.LIQ_LTV,
      title: (
        <HeaderCell
          label="Liq. LTV"
          className={styles.headerCellText}
          columnKey={TableColumnKey.LIQ_LTV}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan: TokenLoan) => {
        const liquidationLtv = loan.liquidationLtvBp / 100
        const color = liquidationLtv ? getColorByPercent(liquidationLtv, HealthColorIncreasing) : ''
        return (
          <HorizontalCell
            className={styles.bodyCellText}
            value={createPercentValueJSX(liquidationLtv)}
            textColor={color}
          />
        )
      },
    }

    return insertAtArray(columns, 3, column)
  }

  return columns
}
