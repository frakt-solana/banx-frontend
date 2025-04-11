import { ElementType, FC } from 'react'

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconLoader,
} from '@tabler/icons-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SolanaFMLink } from '@banx/components/SolanaLinks'

import { Copy } from '@banx/icons'

import { copyToClipboard } from '../common'
import { SnackbarProps, SnackbarType } from './types'

import styles from './Snackbar.module.scss'

const ICON_MAP: Record<Exclude<SnackbarType, undefined>, ElementType> = {
  success: IconCircleCheck,
  error: IconCircleX,
  warning: IconAlertTriangle,
  loading: IconLoader,
  info: IconInfoCircle,
}

type SnackMessageProps = Pick<SnackbarProps, 'message' | 'solanaExplorerPath' | 'type' | 'icon'>
export const SnackMessage: FC<SnackMessageProps> = ({
  message,
  solanaExplorerPath,
  type = 'info',
  icon,
}) => {
  const Icon = ICON_MAP[type]

  const isLoading = type === 'loading'

  return (
    <div className={styles.snackMessageWrapper}>
      <div className={classNames(styles.snackMessage, styles[`snackMessage__${type}`])}>
        {icon || (
          <Icon className={classNames(styles.snackIcon, { [styles.loadingIcon]: isLoading })} />
        )}
        <p className={styles.snackMessageText}>{message}</p>
      </div>

      {solanaExplorerPath && (
        <SolanaFMLink className={styles.solanaFMBtn} size="small" path={solanaExplorerPath} />
      )}
    </div>
  )
}

type SnackDescriptionProps = Pick<SnackbarProps, 'type' | 'description' | 'copyButtonProps'>
export const SnackDescription: FC<SnackDescriptionProps> = ({
  type,
  description = '',
  copyButtonProps = {},
}) => {
  const { label: copyBtnLabel = 'Copy', textToCopy } = copyButtonProps

  const onBtnClick = () => {
    copyToClipboard(textToCopy || '')
  }

  return (
    <div
      className={classNames(
        styles.snackDescriptionWrapper,
        styles[`snackDescriptionWrapper__${type}`],
      )}
    >
      {description}
      {!!textToCopy && (
        <Button
          onClick={onBtnClick}
          type="circle"
          variant="tertiary"
          className={styles.snackCopyButton}
        >
          <Copy />
          {copyBtnLabel}
        </Button>
      )}
    </div>
  )
}

type ProgressBarProps = {
  type: SnackbarType
  duration: number
}

export const SnachProgressBar = ({ type, duration }: ProgressBarProps) => {
  return (
    <div
      className={classNames(styles.snackProgress, styles[`snackProgress__${type}`])}
      style={{ animationDuration: `${duration}ms` }}
    />
  )
}
