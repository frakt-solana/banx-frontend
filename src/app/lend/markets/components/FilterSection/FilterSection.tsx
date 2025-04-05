import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import {
  FilterDropdown,
  MARKET_OPTIONS_WITHOUT_ALL,
  TokenDropdown,
} from '@banx/components/Dropdowns'
import { Search } from '@banx/components/Search'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import { TooltipWrapper } from '@banx/components/Tooltip'

import { MarketCategory } from '@banx/api/tokens'
import { MARKETS_CATEGORIES } from '@banx/constants'
import { Fire, StarSecondary } from '@banx/icons'

import { SortField } from '../../hooks'

import styles from './FilterSection.module.scss'

interface FilterSectionProps {
  sortParams: SortDropdownProps<SortField>
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedLendingToken: LendingTokenType
  handleSelectedTokenChange: (value: LendingTokenType) => void
  selectedCategory: MarketCategory
  onChangeCategory: (category: MarketCategory) => void
  isHotFilterActive: boolean
  onToggleHotFilter: () => void
  isDisabledHotFilter: boolean
  isExtraRewardFilterActive: boolean
  onToggleExtraRewardFilter: () => void
  isDisabledExtraRewardFilter: boolean
}

const FilterSection: FC<FilterSectionProps> = ({
  sortParams,
  searchQuery,
  setSearchQuery,
  selectedLendingToken,
  handleSelectedTokenChange,
  selectedCategory,
  onChangeCategory,
  isHotFilterActive,
  onToggleHotFilter,
  isDisabledHotFilter,
  isExtraRewardFilterActive,
  onToggleExtraRewardFilter,
  isDisabledExtraRewardFilter,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterContent}>
        <TokenDropdown
          option={selectedLendingToken}
          options={MARKET_OPTIONS_WITHOUT_ALL}
          onChange={handleSelectedTokenChange}
        />

        <FilterDropdown>
          <CategoryContent selectedCategory={selectedCategory} onChange={onChangeCategory} />

          <div className={styles.filterButtonsContainer}>
            <span className={styles.filterButtonsTitle}>Tags</span>
            <div className={styles.filterButtons}>
              <HotFilterButton
                isActive={isHotFilterActive}
                isDisabled={isDisabledHotFilter}
                onClick={onToggleHotFilter}
              />

              <ExtraRewardFilterButton
                isActive={isExtraRewardFilterActive}
                isDisabled={isDisabledExtraRewardFilter}
                onClick={onToggleExtraRewardFilter}
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
export default FilterSection

interface FilterButtonProps {
  isActive: boolean
  isDisabled: boolean
  onClick: () => void
}

const HotFilterButton: FC<FilterButtonProps> = ({ isActive, isDisabled, onClick }) => (
  <TooltipWrapper title={isDisabled ? 'No hot collections currently' : 'Hot collections'}>
    <Button
      className={classNames(styles.filterButton, {
        [styles.active]: isActive,
        [styles.disabled]: isDisabled,
      })}
      onClick={onClick}
      disabled={isDisabled}
      variant="tertiary"
      type="circle"
    >
      <Fire />
      Hot
    </Button>
  </TooltipWrapper>
)

const ExtraRewardFilterButton: FC<FilterButtonProps> = ({ isActive, isDisabled, onClick }) => (
  <TooltipWrapper
    title={isDisabled ? 'No markets with extra rewards' : 'Markets with extra rewards'}
  >
    <Button
      className={classNames(styles.filterButton, {
        [styles.active]: isActive,
        [styles.disabled]: isDisabled,
      })}
      onClick={onClick}
      disabled={isDisabled}
      variant="tertiary"
      type="circle"
    >
      <StarSecondary />
      Rewards
    </Button>
  </TooltipWrapper>
)

interface CategoryContentProps {
  selectedCategory: MarketCategory
  onChange: (category: MarketCategory) => void
}

export const CategoryContent: FC<CategoryContentProps> = ({ selectedCategory, onChange }) => {
  return (
    <div className={styles.categoryContent}>
      <span className={styles.categoryContentTitle}>Categories</span>

      <div className={styles.categories}>
        {MARKETS_CATEGORIES.map((category) => (
          <div
            key={category.key}
            onClick={() => onChange(category.key)}
            className={styles.valueWithRadio}
          >
            <div
              className={classNames(styles.radioCircle, {
                [styles.active]: selectedCategory === category.key,
              })}
            />
            <span>{category.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
