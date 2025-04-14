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

import { CoinCrashed, CoinPlus, Warning } from '@banx/icons'

import { SortPreviewField } from '../constants'

import styles from '../LenderLoansSection.module.scss'

interface FilterSectionProps {
  sortParams: SortDropdownProps<SortPreviewField>

  searchQuery: string
  setSearchQuery: (value: string) => void

  selectedLendingToken: MarketTokenType
  handleSelectedTokenChange: (value: MarketTokenType) => void

  terminatingLoansAmount: number
  isTerminationFilterEnabled: boolean
  toggleTerminationFilter: () => void

  liquidatedLoansAmount: number
  isLiquidatedFilterEnabled: boolean
  toggleLiquidatedFilter: () => void

  underwaterLoansAmount: number
  isUnderwaterFilterEnabled: boolean
  toggleUnderwaterFilter: () => void
}

export const FilterSection: FC<FilterSectionProps> = ({
  sortParams,

  searchQuery,
  setSearchQuery,

  selectedLendingToken,
  handleSelectedTokenChange,

  terminatingLoansAmount,
  isTerminationFilterEnabled,
  toggleTerminationFilter,

  liquidatedLoansAmount,
  isLiquidatedFilterEnabled,
  toggleLiquidatedFilter,

  underwaterLoansAmount,
  isUnderwaterFilterEnabled,
  toggleUnderwaterFilter,
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
              <LiquidatedFilterButton
                loansAmount={liquidatedLoansAmount}
                isActive={isLiquidatedFilterEnabled}
                onClick={toggleLiquidatedFilter}
              />

              <TerminatingFilterButton
                loansAmount={terminatingLoansAmount}
                isActive={isTerminationFilterEnabled}
                onClick={toggleTerminationFilter}
              />

              <UnderwaterFilterButton
                loansAmount={underwaterLoansAmount}
                isActive={isUnderwaterFilterEnabled}
                onClick={toggleUnderwaterFilter}
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

const LiquidatedFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip label={loansAmount ? 'Liquidated loans' : 'No liquidated loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.liquidated)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.liquidatedFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <CoinCrashed />
        Liquidated
      </Button>
    </div>
  </Tooltip>
)

const TerminatingFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip label={loansAmount ? 'Terminating loans' : 'No terminating loans currently'}>
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

export const UnderwaterFilterButton: FC<FilterButtonProps> = ({
  isActive,
  onClick,
  loansAmount,
}) => (
  <Tooltip label={loansAmount ? 'Underwater loans' : 'No underwater loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.underwater)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.underwaterFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <CoinPlus />
        Underwater
      </Button>
    </div>
  </Tooltip>
)
