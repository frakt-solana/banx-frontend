import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { WalletConnectButton } from '@banx/components/Buttons'
import ModeSwitcher from '@banx/components/ModeSwitcher'

import { PATHS } from '@banx/constants'
import { Logo, LogoFull } from '@banx/icons'

import { BurgerIcon } from '../BurgerMenu'
import { Navbar } from '../Navbar'
import { ProtocolStats } from '../ProtocolStats'

import styles from './Header.module.scss'

export const Header = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <Link href={PATHS.ROOT}>
          <LogoFull className={styles.fullLogo} />
          <Logo className={styles.logo} />
        </Link>
        <ProtocolStats />
      </div>

      <Navbar />

      <div className={styles.widgetContainer}>
        <ModeSwitcher className={styles.modeSwitcher} />
        {connected && <BanxNotificationsButton />}
        <WalletConnectButton />
        <BurgerIcon />
      </div>
    </div>
  )
}
