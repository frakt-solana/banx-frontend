import { ReactNode } from 'react'

import { NotificationPlacement } from 'antd/es/notification/interface'

export type SnackbarType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export type CopyButtonProps = Partial<{
  label: string
  textToCopy: string
}>

/** Required props for a snackbar */
interface SnackbarRequired {
  /** Main notification message */
  message: string
}

/** Optional content-related props */
interface SnackbarContent {
  /** Additional description or content block */
  description?: string
  /** SolanaFM explorer link */
  solanaExplorerPath?: string
  /** Optional copy button inside the description */
  copyButtonProps?: CopyButtonProps
}

/** Optional visual/UI props */
interface SnackbarUI {
  /** Custom icon override */
  icon?: ReactNode
  /** Notification type: success, error, info, etc. */
  type?: SnackbarType
  /** Custom class for root container */
  className?: string
  /** Custom class for the close icon */
  closeIconClassName?: string
}

/** Optional behavior & control props */
interface SnackbarBehavior {
  /** Custom key for manually managing the snackbar */
  customKey?: string
  /** Auto close duration in milliseconds */
  autoHideDuration?: number
  /** Prevent auto-close */
  persist?: boolean
  /** Notification position on screen */
  placement?: NotificationPlacement
  /** Show or hide close button */
  closable?: boolean
}

/** Final SnackbarProps */
export type SnackbarProps = SnackbarRequired &
  Partial<SnackbarContent & SnackbarUI & SnackbarBehavior>
