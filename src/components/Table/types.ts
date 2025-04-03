import { CSSProperties, Key, MutableRefObject, ReactElement, ReactNode } from 'react'

import { TableVirtuosoHandle } from 'react-virtuoso'

import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

export interface SortViewParams<SortType> {
  sortParams?: SortDropdownProps<SortType>
  toggleParams?: ToggleProps
}

export interface ColumnType<T> {
  key: string | Key
  title?: ReactElement
  render: (record: T, key?: Key) => ReactNode
}

export type ActiveRowParams<T> = Array<{
  field?: string
  condition: (record: T) => boolean
  cardClassName?: string
  className?: string
  styles?: (record: T) => CSSProperties
}>

export interface TableRowParams<T> {
  activeRowParams?: ActiveRowParams<T>
  onRowClick?: (dataItem: T) => void
}

export interface TableViewProps<T> {
  data: Array<T>
  columns: ColumnType<T>[]
  rowParams?: TableRowParams<T> //? Must be wrapped in useMemo because of render virtual table specific
  loadMore?: () => void
  className?: string
  virtuosoHandleRef?: MutableRefObject<TableVirtuosoHandle | null>
}

export interface TableProps<DataType, SortType> extends TableViewProps<DataType> {
  sortViewParams?: SortViewParams<SortType>

  classNameTableWrapper?: string
  emptyMessage?: ReactNode
  customJSX?: ReactNode
  showCard?: boolean

  loaderSize?: 'large' | 'default' | 'small'
  loaderClassName?: string
  loading?: boolean
}
