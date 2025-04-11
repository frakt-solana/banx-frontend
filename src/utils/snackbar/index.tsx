import { notifications } from '@mantine/notifications'
import classNames from 'classnames'
import _ from 'lodash'
import { ConfirmTransactionErrorReason } from 'solana-transactions-executor'

import { SnachProgressBar, SnackDescription, SnackMessage } from './components'
import { SnackbarProps } from './types'

import styles from './Snackbar.module.scss'

type EnqueueSnackbar = (props: SnackbarProps) => string

export const enqueueSnackbar: EnqueueSnackbar = ({
  message,
  description,
  icon,
  type = 'info',
  autoHideDuration = 4500,
  closable = true,
  persist = false,
  customKey,
  className,
  solanaExplorerPath,
  copyButtonProps,
}) => {
  const key = customKey || _.uniqueId('snack_')

  notifications.show({
    id: key,
    withCloseButton: closable,
    autoClose: persist ? false : autoHideDuration,
    title: (
      <SnackMessage
        type={type}
        icon={icon}
        message={message}
        solanaExplorerPath={solanaExplorerPath}
      />
    ),

    message: (
      <div className={styles.snackContent}>
        {description || copyButtonProps ? (
          <SnackDescription
            description={description}
            type={type}
            copyButtonProps={copyButtonProps}
          />
        ) : null}

        {!persist && autoHideDuration && (
          <SnachProgressBar duration={autoHideDuration} type={type} />
        )}
      </div>
    ),

    classNames: {
      root: classNames(styles.snack, styles[`snack__${type}`], className),
      body: styles.snackBody,
      title: styles.snackTitle,
      description: styles.snackDescription,
      closeButton: styles.closeIcon,
      icon: styles.snackIcon,
      loader: styles.snackIcon,
    },
  })

  return key
}

export const destroySnackbar = (key: string) => notifications.hide(key)

export const enqueueTransactionSent = (signature: string) =>
  enqueueSnackbar({
    message: 'Transaction sent',
    type: 'info',
    solanaExplorerPath: `tx/${signature}`,
  })

export const enqueueWaitingConfirmation = (key: string) =>
  enqueueSnackbar({
    customKey: key,
    message: 'Waiting for confirmation',
    type: 'loading',
    persist: true,
  })

export const enqueueTranactionError = () =>
  enqueueSnackbar({
    message: 'Transaction failed. Please try again',
    type: 'error',
  })

export const enqueueTranactionsError = (count: number) =>
  enqueueSnackbar({
    message: `${count} transaction${count > 1 ? 's' : ''} failed. Please try again`,
    type: 'error',
  })

export const enqueueTransactionsSent = () =>
  enqueueSnackbar({
    message: 'Transactions sent',
    type: 'info',
  })

export const enqueueWaitingConfirmationSingle = (key: string, signature: string) => {
  enqueueSnackbar({
    customKey: key,
    message: 'Waiting for confirmation',
    type: 'loading',
    persist: true,
    solanaExplorerPath: `tx/${signature}`,
  })
}

export const enqueueConfirmationError = (
  signature: string,
  reason: ConfirmTransactionErrorReason,
) => {
  if (reason === ConfirmTransactionErrorReason.TimeoutError) {
    return enqueueSnackbar({
      message: 'Unable to ensure transaction result. Please try increasing priority fees.',
      type: 'warning',
      autoHideDuration: 7,
      solanaExplorerPath: `tx/${signature}`,
    })
  }
  return enqueueTranactionError()
}
