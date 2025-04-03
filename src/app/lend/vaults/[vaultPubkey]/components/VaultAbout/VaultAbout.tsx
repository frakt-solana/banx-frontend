import { FC } from 'react'

import { VaultPreview } from '@banx/api/tokens'
import { Twitter } from '@banx/icons'

import styles from './VaultAbout.module.scss'

const VaultAbout: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { curatorDetails } = vaultPreview

  return (
    <div className={styles.container}>
      <span className={styles.vaultDescription}>{curatorDetails.description}</span>

      <a
        href={curatorDetails.xUrl}
        target="_blank"
        rel="noreferrer"
        className={styles.curatorMainInfo}
      >
        <span>Managed by: {curatorDetails.name}</span>
        <Twitter />
      </a>
    </div>
  )
}

export default VaultAbout
