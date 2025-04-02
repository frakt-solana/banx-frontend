import { FC, PropsWithChildren } from 'react'

import classNames from 'classnames'

import { ChevronDown, Filter as FilterIcon } from '@banx/icons'

import BackdropDropdown from './BackdropDropdown'

import styles from './Dropdowns.module.scss'

interface FilterDropdownProps {
  className?: string
}

export const FilterDropdown: FC<PropsWithChildren<FilterDropdownProps>> = ({
  children,
  className,
}) => {
  return (
    <BackdropDropdown
      className={className}
      buttonContent={(isDropdownOpen) => (
        <div className={styles.dropdownButtonTitle}>
          <FilterIcon />
          <span>Filters</span>
          <ChevronDown
            className={classNames(styles.chevronIcon, {
              [styles.rotate]: isDropdownOpen,
            })}
          />
        </div>
      )}
    >
      {children}
    </BackdropDropdown>
  )
}
