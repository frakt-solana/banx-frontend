import { FC, useMemo } from 'react'

import _ from 'lodash'

import { RBOption, RadioButton } from '@banx/components/RadioButton'

import { Loan } from '@banx/api'
import {
  isLoanLiquidated,
  isLoanRepaymentCallActive,
  isLoanSelling,
  isLoanTerminating,
  isLoanUnderwater,
} from '@banx/utils/core'

import styles from './ExpandedCardContent.module.scss'

interface FilterTableSectionProps {
  loans: Loan[]
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
  [FilterStatus.LIQUIDATED]: isLoanLiquidated,
  [FilterStatus.TERMINATING]: isLoanTerminating,
  [FilterStatus.LISTED]: isLoanSelling,
  [FilterStatus.REPAYMENT_CALL]: isLoanRepaymentCallActive,
  [FilterStatus.UNDERWATER]: isLoanUnderwater,
  [FilterStatus.ALL]: () => true,
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  loans,
  onChange,
  currentOption,
}) => {
  const disabledStatuses = useMemo(
    () => _.mapValues(LOAN_FILTERS, (checkFn) => !loans.some(checkFn)),
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
