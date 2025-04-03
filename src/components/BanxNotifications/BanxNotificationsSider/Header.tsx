import { FC } from 'react'

import styles from './BanxNotificationsSider.module.scss'

export const Header: FC = () => {
  const title = 'Notifications'

  return (
    <div className={styles.header}>
      <div className={styles.headerTitleContainer}>
        <h2 className={styles.headerTitle}>{title}</h2>
      </div>
    </div>
  )
}
