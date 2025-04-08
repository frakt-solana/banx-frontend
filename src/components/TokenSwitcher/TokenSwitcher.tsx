import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { isBanxSolTokenType, isUsdcTokenType } from '@banx/utils/tokens'

import { Button } from '../Buttons'

import styles from './TokenSwitcher.module.scss'

export const TokenSwitcher = () => {
  const { tokenType, setTokenType } = useTokenType()

  return (
    <div className={styles.selectTokenContainer}>
      <Button
        onClick={() => setTokenType(LendingTokenType.BanxSol)}
        className={classNames(styles.selectTokenButton, {
          [styles.active]: isBanxSolTokenType(tokenType),
        })}
        variant="tertiary"
        type="circle"
      >
        <SOL /> SOL
      </Button>
      <Button
        onClick={() => setTokenType(LendingTokenType.Usdc)}
        className={classNames(styles.selectTokenButton, {
          [styles.active]: isUsdcTokenType(tokenType),
        })}
        variant="tertiary"
        type="circle"
      >
        <USDC /> USDC
      </Button>
    </div>
  )
}
