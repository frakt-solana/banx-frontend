'use client'

import { FC, PropsWithChildren } from 'react'

import { WalletAccountSidebar } from '@banx/components/WalletAccountSidebar'

import { useTheme } from '@banx/hooks'

import BurgerMenu from './components/BurgerMenu'
import { Header } from './components/Header'

import styles from './AppLayout.module.scss'

const InitialCalls: FC<PropsWithChildren> = ({ children }) => {
  // useReferralCodeModalTrigger()
  // useFirebaseNotifications()
  // useNotificationModal()
  useTheme()

  return <>{children}</>
}

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <InitialCalls>
      <div className={styles.layout}>
        {/* <TopNotification /> */}
        <Header />
        <WalletAccountSidebar />

        <div className={styles.container}>
          <BurgerMenu />
          {/* <ModalPortal /> */}
          <div className={styles.content}>
            {children}
            {/* <BanxNotificationsSider className={styles.notificationsSider} /> */}
          </div>
        </div>
      </div>
    </InitialCalls>
  )
}
