import { ReactNode } from 'react'

import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { ColumnType } from '../../types'
import { SwitchModeButton } from './components'

import styles from './SortView.module.scss'

interface SortViewProps<DataType, SortType> {
  columns: ColumnType<DataType>[]

  sortParams?: SortDropdownProps<SortType>
  toggleParams?: ToggleProps

  customJSX?: ReactNode
  showCard?: boolean
}

export const SortView = <DataType extends object, SortType>({
  sortParams,
  toggleParams,
  showCard,
  customJSX,
}: SortViewProps<DataType, SortType>) => {
  const { viewState, setViewState } = useTableView()

  const handleViewStateChange = (state: ViewState) => {
    setViewState(state)
  }

  return (
    <div className={styles.sortWrapper}>
      <div className={styles.filters}>{customJSX}</div>

      <div className={styles.rowGap}>
        {showCard && <SwitchModeButton viewState={viewState} onChange={handleViewStateChange} />}
        {toggleParams && <Toggle {...toggleParams} />}
        {sortParams && <SortDropdown {...sortParams} />}
      </div>
    </div>
  )
}
