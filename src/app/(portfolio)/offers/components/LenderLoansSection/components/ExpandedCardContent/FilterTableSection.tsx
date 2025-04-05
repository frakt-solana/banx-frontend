import { FC, useMemo } from 'react'

import { mapValues } from 'lodash'

import { RBOption, RadioButton } from '@banx/components/RadioButton'

import { TokenLoan } from '@banx/api'
import {
  isTokenLoanLiquidated,
  isTokenLoanRepaymentCallActive,
  isTokenLoanSelling,
  isTokenLoanTerminating,
  isTokenLoanUnderWater,
} from '@banx/utils'

import styles from './ExpandedCardContent.module.scss'

interface FilterTableSectionProps {
  loans: TokenLoan[]
  onChange: (option: RBOption) => void
  currentOption: RBOption | undefined
}

export enum FilterStatus {
  ALL = 'all',
  LIQUIDATED = 'liquidated',
  TERMINATING = 'terminating',
  REPAYMENT_CALL = 'repaymentCall',
  LISTED = 'listed',
  UNDERWATER = 'underwater',
}

export const LOAN_FILTERS = {
  [FilterStatus.LIQUIDATED]: isTokenLoanLiquidated,
  [FilterStatus.TERMINATING]: isTokenLoanTerminating,
  [FilterStatus.LISTED]: isTokenLoanSelling,
  [FilterStatus.REPAYMENT_CALL]: isTokenLoanRepaymentCallActive,
  [FilterStatus.UNDERWATER]: isTokenLoanUnderWater,
  [FilterStatus.ALL]: () => true,
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  loans,
  onChange,
  currentOption,
}) => {
  const disabledStatuses = useMemo(
    () => mapValues(LOAN_FILTERS, (checkFn) => !loans.some(checkFn)),
    [loans],
  )

  const options = useMemo(
    () => [
      { label: 'All', value: FilterStatus.ALL },
      {
        label: 'Liquidated',
        value: FilterStatus.LIQUIDATED,
        disabled: disabledStatuses[FilterStatus.LIQUIDATED],
      },
      {
        label: 'Terminating',
        value: FilterStatus.TERMINATING,
        disabled: disabledStatuses[FilterStatus.TERMINATING],
      },
      {
        label: 'Listed',
        value: FilterStatus.LISTED,
        disabled: disabledStatuses[FilterStatus.LISTED],
      },
      {
        label: 'Repayment call',
        value: FilterStatus.REPAYMENT_CALL,
        disabled: disabledStatuses[FilterStatus.REPAYMENT_CALL],
      },
      {
        label: 'Underwater',
        value: FilterStatus.UNDERWATER,
        disabled: disabledStatuses[FilterStatus.UNDERWATER],
      },
    ],
    [disabledStatuses],
  )

  return (
    <div className={styles.filterTableSection}>
      <RadioButton
        options={options}
        currentOption={currentOption ?? options[0]}
        onOptionChange={onChange}
        className={styles.radioButton}
      />
    </div>
  )
}
