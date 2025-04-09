'use client'

import { PropsWithChildren, useEffect } from 'react'

import { App } from 'antd'

import { setNotificationApi } from '@banx/utils/snackbar/global'

export const SnackbarProvider = ({ children }: PropsWithChildren) => {
  return <InternalSnackbarProvider>{children}</InternalSnackbarProvider>
}

const InternalSnackbarProvider = ({ children }: PropsWithChildren) => {
  const { notification } = App.useApp()

  useEffect(() => {
    setNotificationApi(notification)
  }, [notification])

  return <>{children}</>
}
