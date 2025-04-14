import { FC } from 'react'

import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import classNames from 'classnames'

import { SortOrder } from '../SortDropdown'
import Tooltip from '../Tooltip'

import styles from './TableCells.module.scss'

type SortColumnOption<T> = { key: T; order: SortOrder }

interface HeaderCellProps<T> {
  label: string
  tooltipText?: string
  align?: 'left' | 'right'
  className?: string

  columnKey?: T
  onSort?: (value: { key: T; order: SortOrder }) => void
  selectedSortOption?: SortColumnOption<T>
}

export const HeaderCell = <T extends string>({
  label,
  tooltipText,
  align = 'right',
  className,

  columnKey,
  onSort,
  selectedSortOption,
}: HeaderCellProps<T>) => {
  const isActiveSortColumn = selectedSortOption?.key === columnKey
  const currentSortDirection = isActiveSortColumn ? selectedSortOption?.order : undefined

  const handleSort = () => {
    if (!columnKey || !onSort) return

    const newSortDirection = currentSortDirection === 'desc' ? 'asc' : 'desc'
    onSort({ key: columnKey, order: newSortDirection })
  }

  const headerCellClasses = classNames(
    styles.headerCell,
    { [styles.alignLeft]: align === 'left' },
    { [styles.sortable]: !!columnKey },
    className,
  )

  return (
    <div onClick={handleSort} className={headerCellClasses}>
      <span>{label}</span>
      {tooltipText && <Tooltip label={tooltipText} position="top" />}
      {columnKey && (
        <SortIcons isActive={isActiveSortColumn} sortDirection={currentSortDirection} />
      )}
    </div>
  )
}

interface SortIconsProps {
  isActive: boolean
  sortDirection: SortOrder | undefined
}

const SortIcons: FC<SortIconsProps> = ({ isActive, sortDirection }) => {
  const isAscActive = isActive && sortDirection === 'asc'
  const isDescActive = isActive && sortDirection === 'desc'

  return (
    <span className={styles.sortIcon}>
      <IconChevronUp
        color={isAscActive ? 'var(--content-primary)' : 'var(--content-secondary)'}
        size={8}
      />
      <IconChevronDown
        color={isDescActive ? 'var(--content-primary)' : 'var(--content-secondary)'}
        size={8}
      />
    </span>
  )
}
