import { FC } from 'react'

import classNames from 'classnames'

import {
  FilterDropdown,
  MARKET_OPTIONS,
  MarketTokenType,
  TokenDropdown,
} from '@banx/components/Dropdowns'
import { Search } from '@banx/components/Search'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { MARKETS_CATEGORIES, MarketCategory } from '@banx/constants'

import { SortField } from '../../hooks'

import styles from './FilterSection.module.scss'

interface FilterSectionProps {
  sortParams: SortDropdownProps<SortField>
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedLendingToken: MarketTokenType
  handleSelectedTokenChange: (value: MarketTokenType) => void
  selectedCategory: MarketCategory
  onChangeCategory: (category: MarketCategory) => void
}

export const FilterSection: FC<FilterSectionProps> = ({
  sortParams,
  searchQuery,
  setSearchQuery,
  selectedLendingToken,
  handleSelectedTokenChange,
  selectedCategory,
  onChangeCategory,
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
          <CategoryContent selectedCategory={selectedCategory} onChange={onChangeCategory} />
        </FilterDropdown>

        <Search value={searchQuery} onChange={setSearchQuery} />
      </div>

      <SortDropdown {...sortParams} />
    </div>
  )
}

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
