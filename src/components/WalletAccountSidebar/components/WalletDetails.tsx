import { useWallet } from '@solana/wallet-adapter-react'

import Checkbox from '@banx/components/Checkbox'
import UserAvatar from '@banx/components/UserAvatar'

import { useDiscordUser } from '@banx/hooks'
import { Copy, SignOut } from '@banx/icons'
import { useIsLedger } from '@banx/store'
import { copyToClipboard, shortenAddress } from '@banx/utils'

import styles from '../WalletAccountSidebar.module.scss'

export const WalletDetails = () => {
  const { publicKey, disconnect } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { isLedger, setIsLedger } = useIsLedger()
  const { data: discordUserData } = useDiscordUser()

  const handleCopyAddress = () => copyToClipboard(walletPubkey)

  return (
    <div className={styles.walletDetailsContainer}>
      <h3 className={styles.walletDetailsTitle}>Wallet</h3>
      <div className={styles.walletDetailsSection}>
        <div className={styles.walletDetailsContent}>
          <UserAvatar
            className={styles.userAvatar}
            imageUrl={discordUserData?.avatarUrl ?? undefined}
          />
          <div className={styles.walletDetails}>
            <div className={styles.walletAddressSection} onClick={handleCopyAddress}>
              <span className={styles.walletAddressText}>{shortenAddress(walletPubkey)}</span>
              <Copy />
            </div>
            <Checkbox
              className={styles.ledgerCheckbox}
              onChange={() => setIsLedger(!isLedger)}
              label="I use ledger"
              checked={isLedger}
            />
          </div>
        </div>
        <div className={styles.disconnectButton} onClick={disconnect}>
          <SignOut />
          <span>Disconnect</span>
        </div>
      </div>
    </div>
  )
}
