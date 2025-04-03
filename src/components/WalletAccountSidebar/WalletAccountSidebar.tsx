'use client'

import { useRef } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useOnClickOutside, useWalletAdapters } from '@banx/hooks'
import { CloseModal } from '@banx/icons'
import { useModal } from '@banx/store'

import {
  ClaimSection,
  Escrow,
  SidebarFooter,
  WalletAssets,
  WalletDetails,
  WalletList,
} from './components'
import { useWalletSidebar } from './hooks'

import styles from './WalletAccountSidebar.module.scss'

export const WalletAccountSidebar = () => {
  const { connected } = useWallet()

  const { visible: isWalletSidebarVisible, setVisible } = useWalletSidebar()
  const { visible: isModalVisible } = useModal()

  const wallets = useWalletAdapters({
    onWalletSelect: () => setVisible(false),
  })

  const containerRef = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(containerRef, () => {
    if (isWalletSidebarVisible && !isModalVisible) {
      setVisible(false)
    }
  })

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(styles.walletSidebarContainer, {
          [styles.visible]: isWalletSidebarVisible,
        })}
      >
        {connected && <WalletAccountOverview />}
        {!connected && <WalletList wallets={wallets} />}
        <SidebarFooter />
      </div>

      <div
        className={classNames(styles.sidebarOverlay, { [styles.visible]: isWalletSidebarVisible })}
      />
    </>
  )
}

const WalletAccountOverview = () => (
  <>
    <CloseIconComponent />
    <div className={styles.accountOverviewContainer}>
      <WalletDetails />
      <Escrow />
      <ClaimSection />
    </div>
    <WalletAssets />
  </>
)

const CloseIconComponent = () => {
  const { visible: isVisible, setVisible } = useWalletSidebar()

  return (
    <div
      onClick={() => setVisible(false)}
      className={classNames(styles.closeIcon, { [styles.visible]: isVisible })}
    >
      <CloseModal />
    </div>
  )
}
