import { SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { Hourglass, Snowflake } from '@banx/icons'
import {
  HealthColorIncreasing,
  getColorByPercent,
  getTokenLoanSupply,
  isTokenLoanFrozen,
  isTokenLoanListed,
  isTokenLoanSelling,
} from '@banx/utils'

import { APRCell, ActionsCell, DebtCell, LTVCell } from './TableCells'

import styles from './page.module.scss'

interface GetTableColumnsProps {
  toggleLoanInSelection: (loan: core.TokenLoan) => void
  findLoanInSelection: (loanPubkey: string) => core.TokenLoan | null
  onSelectAll: () => void
  isCardView: boolean
  hasSelectedLoans: boolean
}

export const getTableColumns = ({
  isCardView,
  findLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
  toggleLoanInSelection,
}: GetTableColumnsProps) => {
  const columns: ColumnType<core.TokenLoan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (loan) => (
        <CollateralTokenCell
          key={loan.publicKey}
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          amount={getTokenLoanSupply(loan)}
          ticker={loan.collateral.ticker}
          logoUrl={loan.collateral.logoUrl}
          rightContentJSX={createRightContentJSX(loan)}
          collateralPrice={loan.collateralPrice}
        />
      ),
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
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
      key: 'freeze',
      title: <HeaderCell label="Freeze" />,
      render: (loan) => {
        const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
        const freezeValue = isTokenLoanFrozen(loan) ? `${terminationFreezeInDays} days` : '--'
        return <HorizontalCell value={freezeValue} />
      },
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: (loan) => {
        const expiredAt = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
        const showTimer = !isTokenLoanSelling(loan) && !isTokenLoanListed(loan)

        return showTimer ? <Timer expiredAt={expiredAt} /> : '--'
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      title: <HeaderCell label="" />,
      render: (loan) => (
        <ActionsCell
          loan={loan}
          isCardView={isCardView}
          disabledAction={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}

const createRightContentJSX = (loan: core.TokenLoan) => {
  if ((isTokenLoanListed(loan) && !isTokenLoanFrozen(loan)) || isTokenLoanSelling(loan)) {
    return null
  }

  const tooltipText = isTokenLoanFrozen(loan)
    ? `This loan has a freeze period during which it can't be terminated`
    : 'This loan is available for a limited amount of time'

  return (
    <Tooltip title={tooltipText}>
      {isTokenLoanFrozen(loan) ? (
        <Snowflake className={styles.snowflakeIcon} />
      ) : (
        <Hourglass className={styles.hourglassIcon} />
      )}
    </Tooltip>
  )
}
