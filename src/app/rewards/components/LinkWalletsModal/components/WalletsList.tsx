import { WalletListItem } from '@banx/components/WalletAccountSidebar'

import { useWalletAdapters } from '@banx/hooks'

import styles from '../LinkWalletsModal.module.scss'

export const WalletsList = () => {
  const wallets = useWalletAdapters()

  return (
    <div className={styles.walletsList}>
      {wallets.map(({ adapter, select }, idx) => (
        <WalletListItem
          key={idx}
          onClick={select}
          icon={adapter.icon}
          name={adapter.name}
          className={styles.walletItem}
        />
      ))}
    </div>
  )
}
