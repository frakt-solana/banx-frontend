import { useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'

import { notifications } from '@banx/api/common'
import { CloseModal } from '@banx/icons'

import styles from './TopNotification.module.scss'

const useTopNotification = () => {
  const notificationRef = useRef<HTMLDivElement>(null)
  const [closed, setClosed] = useState(false)

  const { data: topbarNotificationHtml } = useQuery({
    queryKey: ['topBarNotification'],
    queryFn: () => {
      return notifications.fetchTopBarNotification()
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000,
  })

  const close = () => {
    setClosed(true)
  }

  return {
    content: topbarNotificationHtml,
    notificationRef,
    hidden: !!(closed || !topbarNotificationHtml),
    close,
  }
}

export const TopNotification = () => {
  const { content, notificationRef, hidden, close } = useTopNotification()

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.wrapper__hidden]: hidden,
      })}
      ref={notificationRef}
    >
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: content as string }} />
      <div className={styles.closeIcon} onClick={close}>
        <CloseModal />
      </div>
    </div>
  )
}
