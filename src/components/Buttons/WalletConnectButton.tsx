import { useWallet } from '@solana/wallet-adapter-react'

import { Wallet } from '@banx/icons'
import { shortenAddress } from '@banx/utils'

import { useWalletSidebar } from '../WalletAccountSidebar'
import { Button } from './Button'

import styles from './Buttons.module.scss'

export const WalletConnectButton = () => {
  const { toggleVisibility } = useWalletSidebar()
  const { publicKey, connected } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const ConnectedButton = () => (
    <Button
      type="standard"
      variant="tertiary"
      className={styles.connectedButton}
      onClick={toggleVisibility}
    >
      <span className={styles.walletAddress}>{shortenAddress(walletPubkey)}</span>
      <span className={styles.mobileWalletAddress}>{walletPubkey.slice(0, 4)}</span>
    </Button>
  )

  const DisconnectedButton = () => (
    <Button onClick={toggleVisibility} className={styles.disconnectedButton}>
      <Wallet className={styles.walletIcon} />
      <span>Connect wallet</span>
    </Button>
  )

  return connected ? <ConnectedButton /> : <DisconnectedButton />
}
