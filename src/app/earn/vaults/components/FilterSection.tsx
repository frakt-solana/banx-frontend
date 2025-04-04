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

import { CoinPlus } from '@banx/icons'

import { SortField } from '../hooks'

import styles from '../ClientLendVaultsPage.module.scss'

interface FilterSectionProps {
  sortParams: SortDropdownProps<SortField>
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedLendingToken: MarketTokenType
  handleSelectedTokenChange: (value: MarketTokenType) => void
  isUserDepositFilterEnabled: boolean
  toggleUserDepositFilter: () => void
  depositedVaultsAmount: number
}

const FilterSection: FC<FilterSectionProps> = ({
  sortParams,
  searchQuery,
  setSearchQuery,
  selectedLendingToken,
  handleSelectedTokenChange,
  isUserDepositFilterEnabled,
  toggleUserDepositFilter,
  depositedVaultsAmount,
}) => {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterContent}>
        <TokenDropdown
          option={selectedLendingToken}
          options={MARKET_OPTIONS}
          onChange={handleSelectedTokenChange}
        />

        <FilterDropdown>
          <UserDepositFilterButton
            isActive={isUserDepositFilterEnabled}
            onClick={toggleUserDepositFilter}
            vaultsAmount={depositedVaultsAmount}
          />
        </FilterDropdown>

        <Search value={searchQuery} onChange={setSearchQuery} />
      </div>

      <SortDropdown {...sortParams} />
    </div>
  )
}
export default FilterSection

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  vaultsAmount: number
}

const UserDepositFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, vaultsAmount }) => (
  <Tooltip title={vaultsAmount ? 'Vaults with your deposits' : 'No active deposits'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.userDeposit)}
      data-amount={vaultsAmount > 0 ? vaultsAmount : null}
    >
      <Button
        onClick={onClick}
        className={classNames(
          styles.userDepositFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !vaultsAmount },
        )}
        disabled={!vaultsAmount}
        variant="tertiary"
        type="circle"
      >
        <CoinPlus />
        My deposits
      </Button>
    </div>
  </Tooltip>
)
