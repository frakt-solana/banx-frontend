import { memo } from 'react'

import classNames from 'classnames'
import _ from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { TableProps } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.scss'

const Table = <DataType extends object, SortType>({
  virtuosoHandleRef,
  data,
  columns,
  sortViewParams,
  rowParams,
  showCard,
  loading,
  emptyMessage,
  className,
  classNameTableWrapper,
  loadMore,
  customJSX,
  loaderSize,
  loaderClassName,
}: TableProps<DataType, SortType>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  return (
    <>
      {sortViewParams && (
        <SortView columns={columns} showCard={showCard} customJSX={customJSX} {...sortViewParams} />
      )}

      {loading && <Loader className={loaderClassName} size={loaderSize} />}

      {emptyMessage && !loading && emptyMessage}

      {!loading && (
        <div className={classNames(styles.tableWrapper, classNameTableWrapper)}>
          {!_.isEmpty(data) && (
            <ViewComponent
              virtuosoHandleRef={virtuosoHandleRef}
              data={data}
              columns={columns}
              rowParams={rowParams}
              className={className}
              loadMore={loadMore}
            />
          )}
        </div>
      )}
    </>
  )
}

export default memo(Table) as typeof Table
