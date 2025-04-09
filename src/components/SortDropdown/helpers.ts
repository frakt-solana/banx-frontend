import _ from 'lodash'

import styles from './SortDropdown.module.scss'

export const getSortOrderClassName = (sortOrder: string) => {
  const isAsc = _.endsWith(sortOrder, 'asc')
  return isAsc ? styles.rotate : ''
}
