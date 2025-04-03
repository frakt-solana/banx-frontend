'use client'

import { Button } from '@banx/components/Buttons'

import { AppSettingsModal } from '@banx/components/modals'

import { Settings } from '@banx/icons'
import { useModal } from '@banx/store'

import { COMMUNITY_LINKS } from '../constants'

import styles from '../WalletAccountSidebar.module.scss'

export const SidebarFooter = () => {
  const { open: openModal } = useModal()

  const handleClick = () => {
    openModal(AppSettingsModal)
  }

  return (
    <div className={styles.sidebarFooter}>
      <Button
        onClick={handleClick}
        className={styles.settingsButton}
        type="circle"
        variant="tertiary"
      >
        <Settings /> <span>Settings</span>
      </Button>
      <div className={styles.communityLinks}>
        {COMMUNITY_LINKS.map(({ name, url, icon: Icon }) => (
          <a key={name} href={url} target="_blank" rel="noreferrer">
            {Icon ? <Icon /> : null}
          </a>
        ))}
      </div>
    </div>
  )
}
