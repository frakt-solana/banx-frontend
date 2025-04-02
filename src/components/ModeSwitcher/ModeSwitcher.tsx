import { FC } from 'react'

import classNames from 'classnames'

import styles from './ModeSwitcher.module.scss'

type ModeSwitcherProps = {
  className?: string
}

enum AssetMode {
  NFT = 'nft',
  Token = 'token',
}

const ModeSwitcher: FC<ModeSwitcherProps> = ({ className }) => {
  const MODES = [AssetMode.Token, AssetMode.NFT]

  const getLabelByMode = (mode: AssetMode): string => {
    return mode === AssetMode.NFT ? 'NFTs' : 'Tokens'
  }

  return (
    <div className={classNames(styles.modeSwitcher, className)}>
      {MODES.map((mode) => (
        <div
          key={mode}
          className={classNames(styles.mode, { [styles.active]: mode === AssetMode.Token })}
        >
          <span className={styles.label}>{getLabelByMode(mode)}</span>
        </div>
      ))}
    </div>
  )
}

export default ModeSwitcher
