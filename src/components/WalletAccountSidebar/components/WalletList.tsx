import { FC } from 'react'

import { Adapter } from '@solana/wallet-adapter-base'
import classNames from 'classnames'

import { iconComponents } from '../constants'

import styles from '../WalletAccountSidebar.module.scss'

interface WalletListProps {
  wallets: Array<{
    adapter: Adapter
    select: () => void
  }>
}

export const WalletList: FC<WalletListProps> = ({ wallets }) => {
  return (
    <div className={styles.walletListContainer}>
      <h3 className={styles.walletListTitle}>Connect your wallet</h3>
      <div className={styles.walletGrid}>
        {wallets.map(({ adapter, select }) => (
          <WalletListItem
            key={adapter.name}
            onClick={select}
            icon={adapter.icon}
            name={adapter.name}
          />
        ))}
      </div>
    </div>
  )
}

interface WalletListItemProps {
  onClick: () => void
  icon: string
  name: string
  className?: string
}

export const WalletListItem: FC<WalletListItemProps> = ({ onClick, icon, name, className }) => {
  return (
    <div className={classNames(styles.walletListItem, className)} onClick={onClick}>
      <WalletIcon icon={icon} name={name} />
      <span className={styles.walletName}>{name}</span>
    </div>
  )
}

const WalletIcon: FC<{ icon: string; name: string }> = ({ icon, name }) => {
  const IconComponent = iconComponents[name]
  return IconComponent ? (
    <IconComponent className={styles.customWalletIcon} />
  ) : (
    <img src={icon} alt={name} className={styles.walletImage} />
  )
}
