import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '../Buttons'

import styles from './EmptyList.module.scss'

interface EmptyListProps {
  message: string
  className?: string
  buttonProps?: {
    text: string
    onClick: () => void
  }
}

const EmptyList: FC<EmptyListProps> = ({ message, className, buttonProps }) => {
  const { text, onClick } = buttonProps || {}

  if (!message) return null

  return (
    <div className={classNames(styles.wrapper, className)}>
      <div className={styles.emptyList}>
        <span className={styles.emptyListMessage}>{message}</span>
      </div>
      {buttonProps && (
        <Button onClick={onClick} className={styles.emptyListButton}>
          {text}
        </Button>
      )}
    </div>
  )
}

export default EmptyList
