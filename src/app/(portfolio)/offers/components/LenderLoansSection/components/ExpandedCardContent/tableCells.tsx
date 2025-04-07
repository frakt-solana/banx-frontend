import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { useModal } from '@banx/store/common'
import {
  HealthColorIncreasing,
  STATUS_LOANS_COLOR_MAP,
  calculateLentTokenValueWithInterest,
  calculateTimeFromNow,
  calculateTokenLoanAccruedInterest,
  calculateTokenLoanLtvByLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  getColorByPercent,
  isLoanActive,
  isLoanLiquidated,
  isLoanSelling,
  isLoanTerminating,
} from '@banx/utils'

import { useLenderLoansTxns } from '../../hooks'
import ManageModal from './ManageModal'
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

export const ClaimCell: FC<{ loan: Loan }> = ({ loan }) => {
  const lendingToken = loan.bondTradeTransaction.lendingToken

  const accruedInterest = calculateTokenLoanAccruedInterest(loan)
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan)

  const totalRepaidAmount = loan.totalRepaidAmount || 0
  const lentValue = totalRepaidAmount + calculateTokenLoanValueWithUpfrontFee(loan).toNumber()

  const tooltipContent = (
    <div className={styles.tooltipContainer}>
      <TooltipRow label="Lent" value={lentValue} lendingToken={lendingToken} />
      <TooltipRow
        label="Accrued interest"
        value={accruedInterest.toNumber()}
        lendingToken={lendingToken}
      />
    </div>
  )

  return (
    <HorizontalCell
      className={styles.bodyCellText}
      tooltipContent={tooltipContent}
      value={
        <DisplayValue
          value={lentTokenValueWithInterest.toNumber()}
          strictTokenType={lendingToken}
        />
      }
    />
  )
}

interface LTVCellProps {
  loan: Loan
}

export const LTVCell: FC<LTVCellProps> = ({ loan }) => {
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, lentTokenValueWithInterest)

  return (
    <HorizontalCell
      className={styles.bodyCellText}
      value={createPercentValueJSX(ltvPercent, '0%')}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

interface StatusCellProps {
  loan: Loan
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = getTokenLoanStatus(loan)
  const loanStatusColor = STATUS_LOANS_COLOR_MAP[loanStatus]

  const timeContent = getTimeContent(loan)

  return (
    <div className={styles.statusCell}>
      <span className={styles.statusCellTimeText}>{timeContent}</span>
      <span style={{ color: loanStatusColor }} className={styles.bodyCellText}>
        {capitalize(loanStatus)}
      </span>
    </div>
  )
}

const getTimeContent = (loan: Loan) => {
  const currentTimeInSeconds = moment().unix()
  const { terminationStartedAt, soldAt } = loan.bondTradeTransaction

  if (isLoanTerminating(loan) && !isLoanLiquidated(loan)) {
    const auctionEndTime = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
    return <Timer expiredAt={auctionEndTime} />
  }

  if (isLoanSelling(loan)) {
    const timeSinceActivation = currentTimeInSeconds - terminationStartedAt
    return calculateTimeFromNow(timeSinceActivation)
  }

  if (isLoanActive(loan) || isLoanLiquidated(loan)) {
    const timeSinceActivation = currentTimeInSeconds - soldAt
    return calculateTimeFromNow(timeSinceActivation)
  }

  return null
}

export const ActionsCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { claimTokenLoan } = useLenderLoansTxns()
  const { open } = useModal()

  const isLoanTerminating = isLoanTerminating(loan)
  const isLoanLiquidated = isLoanLiquidated(loan)

  const canClaim = isLoanLiquidated && isLoanTerminating

  const showModal = () => {
    open(ManageModal, { loan })
  }

  return (
    <div className={styles.actionsButtons}>
      {canClaim && (
        <Button onClick={() => claimTokenLoan(loan)} className={styles.actionButton} size="medium">
          Claim
        </Button>
      )}

      {!canClaim && (
        <Button
          className={styles.actionButton}
          onClick={(event) => {
            showModal()
            event.stopPropagation()
          }}
          variant="secondary"
          size="medium"
        >
          Manage
        </Button>
      )}
    </div>
  )
}
