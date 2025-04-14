import { FC, useMemo } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api'

import { LoanOptimistic, useLoansTxns } from '../../hooks'
import { calculateLoansStats, getPayInterestActionText } from './helpers'

import styles from './ExpandedCardContent.module.scss'

interface SummaryProps {
  loans: Loan[]
  selectedLoansOptimistics: LoanOptimistic[]
}

export const Summary: FC<SummaryProps> = ({ loans, selectedLoansOptimistics }) => {
  const { repayAllLoans, repayUnpaidLoansInterest } = useLoansTxns()

  const lendingToken = loans[0].bondTradeTransaction.lendingToken

  const selectedLoans = useMemo(
    () => selectedLoansOptimistics.map(({ loan }) => loan),
    [selectedLoansOptimistics],
  )

  const { totalSelectedLoans, totalDebt, totalWeeklyFee, totalValueToPay, weightedApr } =
    calculateLoansStats(selectedLoans)

  const classNamesProps = {
    container: classNames(styles.summaryAdditionalStat, styles.summaryHiddenStat),
  }

  return (
    <div className={styles.summary}>
      <div className={styles.summaryMainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>

      <div className={styles.summaryAdditionalStats}>
        <StatInfo
          label="Debt"
          value={<DisplayValue value={totalDebt} strictTokenType={lendingToken} />}
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label={getPayInterestActionText(selectedLoans)}
          value={<DisplayValue value={totalValueToPay} strictTokenType={lendingToken} />}
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label="Weekly fee"
          value={<DisplayValue value={totalWeeklyFee} strictTokenType={lendingToken} />}
          classNamesProps={{ container: styles.summaryAdditionalStat }}
        />
        <StatInfo
          label="WAPR"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={classNamesProps}
        />
      </div>

      <div className={styles.summaryControls}>
        <Button
          onClick={repayUnpaidLoansInterest}
          variant="secondary"
          className={styles.summaryActionButton}
          disabled={!totalValueToPay}
        >
          {getPayInterestActionText(selectedLoans)}
          {<DisplayValue value={totalValueToPay} strictTokenType={lendingToken} />}
        </Button>

        <Button
          onClick={repayAllLoans}
          className={styles.summaryActionButton}
          disabled={!totalSelectedLoans}
        >
          Repay <DisplayValue value={totalDebt} strictTokenType={lendingToken} />
        </Button>
      </div>
    </div>
  )
}
