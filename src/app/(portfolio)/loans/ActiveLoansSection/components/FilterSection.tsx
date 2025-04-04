import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import {
  FilterDropdown,
  MARKET_OPTIONS,
  MarketTokenType,
  TokenDropdown,
} from '@banx/components/Dropdowns'
import { Search } from '@banx/components/Search'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import Tooltip from '@banx/components/Tooltip'

import { Coin, Warning } from '@banx/icons'

import { SortField } from '../types'

import styles from '../ActiveLoansSection.module.scss'

interface FilterSectionProps {
  sortParams: SortDropdownProps<SortField>

  searchQuery: string
  setSearchQuery: (value: string) => void

  selectedLendingToken: MarketTokenType
  handleSelectedTokenChange: (value: MarketTokenType) => void

  terminatingLoansAmount: number
  repaymentCallsAmount: number

  isTerminationFilterEnabled: boolean
  toggleTerminationFilter: () => void

  isRepaymentCallFilterEnabled: boolean
  toggleRepaymentCallFilter: () => void
}

export const FilterSection: FC<FilterSectionProps> = ({
  sortParams,
  searchQuery,
  setSearchQuery,
  selectedLendingToken,
  handleSelectedTokenChange,
  terminatingLoansAmount,
  repaymentCallsAmount,
  isTerminationFilterEnabled,
  toggleTerminationFilter,
  isRepaymentCallFilterEnabled,
  toggleRepaymentCallFilter,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterContent}>
        <TokenDropdown
          option={selectedLendingToken}
          options={MARKET_OPTIONS}
          onChange={handleSelectedTokenChange}
        />

        <FilterDropdown>
          <div className={styles.filterButtonsContainer}>
            <span className={styles.filterButtonsTitle}>Tags</span>
            <div className={styles.filterButtons}>
              <TerminatingFilterButton
                loansAmount={terminatingLoansAmount}
                isActive={isTerminationFilterEnabled}
                onClick={toggleTerminationFilter}
              />
              <RepaymentCallFilterButton
                loansAmount={repaymentCallsAmount}
                isActive={isRepaymentCallFilterEnabled}
                onClick={toggleRepaymentCallFilter}
              />
            </div>
          </div>
        </FilterDropdown>

        <Search value={searchQuery} onChange={setSearchQuery} />
      </div>

      <SortDropdown {...sortParams} />
    </div>
  )
}

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  loansAmount: number | null
}

const RepaymentCallFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Repayment calls' : 'No repayment calls currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.repaymentCall)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.repaymentCallFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <Coin />
        Repayment call
      </Button>
    </div>
  </Tooltip>
)

const TerminatingFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Terminating loans' : 'No terminating loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.terminating)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.terminatingFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <Warning />
        Terminating
      </Button>
    </div>
  </Tooltip>
)
