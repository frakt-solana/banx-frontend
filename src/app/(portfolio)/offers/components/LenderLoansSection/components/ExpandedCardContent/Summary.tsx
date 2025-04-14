import { FC, useMemo } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { Loan } from '@banx/api'

import { LoanOptimistic, useLenderLoansTxns } from '../../hooks'
import { calculateLoansStats } from './helpers'

import styles from './ExpandedCardContent.module.scss'

interface SummaryProps {
  loansToClaim: Loan[]
  selectedLoansOptimistics: LoanOptimistic[]
  lendingToken: LendingTokenType
}

export const Summary: FC<SummaryProps> = ({
  loansToClaim,
  selectedLoansOptimistics,
  lendingToken,
}) => {
  const { claimTokenLoans, terminateTokenLoans } = useLenderLoansTxns()

  const selectedLoans = useMemo(
    () => selectedLoansOptimistics.map(({ loan }) => loan),
    [selectedLoansOptimistics],
  )

  const { totalClaim, totalInterest, weightedApr, weightedLtv } = calculateLoansStats(selectedLoans)

  return (
    <div className={styles.summary}>
      {!!loansToClaim.length && (
        <Button
          className={styles.summaryClaimButton}
          onClick={() => claimTokenLoans(loansToClaim)}
          type="circle"
          variant="tertiary"
        >
          Claim defaults
        </Button>
      )}

      <div className={styles.summaryMainStat}>
        <p>
          <DisplayValue value={totalClaim} strictTokenType={lendingToken} />
        </p>
        <p>Lent</p>
      </div>

      <div className={styles.summaryAdditionalStats}>
        <StatInfo
          label="Lent"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{
            container: classNames(styles.summaryAdditionalStat, styles.summaryHiddenStat),
          }}
        />
        <StatInfo
          label="WAPR"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.summaryAdditionalStat }}
        />
        <StatInfo
          label="WLTV"
          value={weightedLtv}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.summaryAdditionalStat }}
        />
        <StatInfo
          label="Interest"
          value={<DisplayValue value={totalInterest} strictTokenType={lendingToken} />}
          classNamesProps={{ container: styles.summaryAdditionalStat }}
        />
      </div>

      <Button
        className={styles.summaryActionButton}
        onClick={() => terminateTokenLoans(selectedLoans)}
        disabled={!selectedLoans.length}
        variant="secondary"
      >
        Terminate
      </Button>
    </div>
  )
}
