import { FC } from 'react'

import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'
import { Tooltip } from '@banx/components/Tooltip'

import { Loan } from '@banx/api'
import { createMultiplyPairFromCollateral } from '@banx/app/multiply/[ticker]/helpers'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { useModal } from '@banx/store/common'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'
import {
  STATUS_LOANS_COLOR_MAP,
  caclulateBorrowTokenLoanValue,
  calcTokenLoanAprWithRepayFee,
  calcTokenWeeklyFeeWithRepayFee,
  calculateTokenLoanLtvByLoanValue,
  isLoanActive,
  isLoanSelling,
  isLoanTerminating,
  isLoanUnderwater,
} from '@banx/utils/core'
import { calculateTimeFromNow } from '@banx/utils/date'
import { getTokenDecimals } from '@banx/utils/tokens'

import { calculateAccruedInterest } from '../../helpers'
import { useLoansTxns } from '../../hooks'
import ManageTokenModal from '../ManageTokenModal'
import RefinanceTokenModal from '../RefinanceTokenModal'
import { getTokenLoanStatus } from './helpers'

import styles from './ExpandedCardContent.module.scss'

interface TooltipRowProps {
  label: string
  value: number
  lendingToken: LendingTokenType
  isSubscriptFormat?: boolean
}
const TooltipRow: FC<TooltipRowProps> = ({
  label,
  value,
  lendingToken,
  isSubscriptFormat = false,
}) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue
        value={value}
        isSubscriptFormat={isSubscriptFormat}
        strictTokenType={lendingToken}
      />
    </span>
  </div>
)

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { bondTradeTransaction, fraktBond } = loan

  const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
  const borrowedValue = fraktBond.borrowedAmount

  const totalAccruedInterest = calculateAccruedInterest(loan)

  const upfrontFee =
    (bondTradeTransaction.borrowerOriginalLent * loan.collateral.upfrontFee) / BASE_POINTS

  const weeklyFee = calcTokenWeeklyFeeWithRepayFee(loan)

  const lendingToken = bondTradeTransaction.lendingToken

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Principal" value={borrowedValue} lendingToken={lendingToken} />
      <TooltipRow
        label="Repaid"
        value={bondTradeTransaction.borrowerFullRepaidAmount}
        lendingToken={lendingToken}
      />
      <TooltipRow
        label="Accrued interest"
        value={totalAccruedInterest}
        lendingToken={lendingToken}
      />
      <TooltipRow label="Upfront fee" value={upfrontFee} lendingToken={lendingToken} />
      <TooltipRow label="Est. weekly interest" value={weeklyFee} lendingToken={lendingToken} />
    </div>
  )

  return (
    <HorizontalCell
      tooltipContent={tooltipContent}
      value={<DisplayValue value={debtValue} strictTokenType={lendingToken} />}
      className={styles.bodyCellText}
    />
  )
}

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const lendingToken = loan.bondTradeTransaction.lendingToken

  const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, debtValue)

  const marketTokenDecimals = getTokenDecimals(lendingToken)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow
        label="Price"
        value={loan.collateralPrice / 10 ** marketTokenDecimals}
        lendingToken={lendingToken}
        isSubscriptFormat
      />
      <TooltipRow label="Debt" value={debtValue} lendingToken={lendingToken} />
    </div>
  )

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltvPercent)}
      tooltipContent={tooltipContent}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
      className={styles.bodyCellText}
    />
  )
}

export const APRCell: FC<{ loan: Loan }> = ({ loan }) => {
  const aprPercent = calcTokenLoanAprWithRepayFee(loan) / 100

  return (
    <HorizontalCell
      value={createPercentValueJSX(aprPercent)}
      className={styles.bodyCellText}
      isHighlighted
    />
  )
}

export const StatusCell: FC<{ loan: Loan }> = ({ loan }) => {
  const loanStatus = getTokenLoanStatus(loan)
  const loanStatusColor = STATUS_LOANS_COLOR_MAP[loanStatus]

  const timeContent = getTimeContent(loan)

  return (
    <div className={styles.statusCell}>
      <span className={styles.statusCellTimeText}>{timeContent}</span>
      <span style={{ color: loanStatusColor }} className={styles.bodyCellText}>
        {_.capitalize(loanStatus)}
      </span>
    </div>
  )
}

const getTimeContent = (loan: Loan) => {
  const { fraktBond } = loan

  if (isLoanActive(loan) || isLoanSelling(loan)) {
    const currentTimeInSeconds = moment().unix()
    const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  if (isLoanTerminating(loan)) {
    const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
    return <Timer expiredAt={expiredAt} />
  }

  return ''
}

interface ActionsCellProps {
  loan: Loan
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, disableActions }) => {
  const { open } = useModal()

  const { sellToRepay } = useLoansTxns()

  const loanTerminating = isLoanTerminating(loan)
  const loanUnderwater = isLoanUnderwater(loan)

  const tooltipTitle = loanUnderwater
    ? 'Cannot sell this loan as the LTV exceeds 100%. Selling this loan would result in a net loss because the debt surpasses the value of the collateral'
    : null

  const pair = createMultiplyPairFromCollateral(
    loan.collateral,
    loan.fraktBond.hadoMarket,
    loan.bondTradeTransaction.lendingToken,
  )

  return (
    <div className={styles.actionsButtons}>
      <Tooltip label={tooltipTitle} className={styles.tooltip}>
        <Button
          size="medium"
          className={styles.actionSellButton}
          disabled={loanUnderwater}
          onClick={(event) => {
            sellToRepay({ loan, pair })
            event.stopPropagation()
          }}
        >
          Sell
        </Button>
      </Tooltip>

      <Button
        size="medium"
        variant="secondary"
        onClick={(event) => {
          open(RefinanceTokenModal, { loan })
          event.stopPropagation()
        }}
      >
        {loanTerminating ? 'Extend' : 'Rollover'}
      </Button>
      <Button
        size="medium"
        disabled={disableActions}
        onClick={(event) => {
          open(ManageTokenModal, { loan })
          event.stopPropagation()
        }}
      >
        Manage
      </Button>
    </div>
  )
}
