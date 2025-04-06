import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api'
import { HealthColorIncreasing, getColorByPercent, getTokenLoanSupply } from '@banx/utils'

import { APRCell, ActionsCell, FreezeCell, LTVCell } from './cells'

type GetTableColumns = (props: { isCardView: boolean }) => ColumnType<Loan>[]
export const getTableColumns: GetTableColumns = ({ isCardView }) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: (loan) => (
        <CollateralTokenCell
          key={loan.publicKey}
          logoUrl={loan.collateral.logoUrl}
          ticker={loan.collateral.ticker}
          amount={getTokenLoanSupply(loan)}
          collateralPrice={loan.collateralPrice}
          lendingToken={loan.bondTradeTransaction.lendingToken}
          showLendingTokenIcon
        />
      ),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (loan) => (
        <HorizontalCell
          value={
            <DisplayValue
              value={loan.bondTradeTransaction.solAmount}
              strictTokenType={loan.bondTradeTransaction.lendingToken}
            />
          }
        />
      ),
    },
    {
      key: 'ltv',
      title: <HeaderCell label="Ltv" />,
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: 'liqLtv',
      title: <HeaderCell label="Liq. LTV" />,
      render: (loan) => {
        const liquidationLtv = loan.liquidationLtvBp / 100
        const color = liquidationLtv ? getColorByPercent(liquidationLtv, HealthColorIncreasing) : ''
        return <HorizontalCell value={createPercentValueJSX(liquidationLtv)} textColor={color} />
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'freeze',
      title: (
        <HeaderCell label="Freeze" tooltipText="Period during which loan can't be terminated" />
      ),
      render: (loan) => <FreezeCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      render: (loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns
}
