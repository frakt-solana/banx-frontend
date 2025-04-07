import { FC, useMemo } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'

import { Loan } from '@banx/api'
import { isLoanRepaymentCallActive, isLoanTerminating } from '@banx/utils'

import styles from './ExpandedCardContent.module.scss'

interface FilterTableSectionProps {
  loans: Loan[]
  onChange: (option: RBOption) => void
  currentOption: RBOption | undefined
}

export enum FilterStatus {
  ALL = 'all',
  TERMINATING = 'terminating',
  REPAYMENT_CALL = 'repaymentCall',
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  loans,
  onChange,
  currentOption,
}) => {
  const isTerminateDisabled = useMemo(() => !loans.some(isLoanTerminating), [loans])
  const isRepaymentCallDisabled = useMemo(() => !loans.some(isLoanRepaymentCallActive), [loans])

  const options = useMemo(
    () => [
      {
        label: 'All',
        value: FilterStatus.ALL,
      },
      {
        label: 'Terminating',
        value: FilterStatus.TERMINATING,
        disabled: isTerminateDisabled,
      },
      {
        label: 'Repayment call',
        value: FilterStatus.REPAYMENT_CALL,
        disabled: isRepaymentCallDisabled,
      },
    ],
    [isTerminateDisabled, isRepaymentCallDisabled],
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
