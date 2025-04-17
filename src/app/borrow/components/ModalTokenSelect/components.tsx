import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import _ from 'lodash'

import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import Tooltip from '@banx/components/Tooltip'

import { bnToHuman } from '@banx/utils/bn'
import { convertToDecimalString, isExponentialNotation, shortenAddress } from '@banx/utils/common'
import { formatCollateralTokenValue, getOracleIcon } from '@banx/utils/tokens'

import { BaseToken } from './ModalTokenSelect'

import styles from './ModalTokenSelect.module.scss'

interface TokenListItemProps {
  token: BaseToken
  onClick: () => void
}

export const TokenListItem: FC<TokenListItemProps> = ({ token, onClick }) => {
  const oracleType = token.collateral.oraclePriceFeedType

  return (
    <div onClick={onClick} className={styles.tokensListItem}>
      <div className={styles.tokensListItemInfo}>
        <ResponsiveImage src={token.collateral.logoUrl} className={styles.tokensListItemIcon} />
        <div className={styles.flexCol}>
          <span className={styles.tokensListItemTicker}>{token.collateral.ticker}</span>
          <span className={styles.tokensListItemAddress}>
            {shortenAddress(token.collateral.mint)}
          </span>
        </div>
        <Tooltip label={`Price feed from the ${_.capitalize(oracleType)} oracle`}>
          {getOracleIcon(oracleType)}
        </Tooltip>
      </div>
      <TokenBalanceInfo token={token} />
    </div>
  )
}

interface TokenBalanceInfoProps {
  token: BaseToken
}

const TokenBalanceInfo: FC<TokenBalanceInfoProps> = ({ token }) => {
  const USDC_BALANCE_TRESHOLD = 0.001

  const { amountInWallet, collateral } = token

  if (!amountInWallet) return null

  const tokensAmount = bnToHuman(amountInWallet, collateral.decimals)
  const tokensAmountInUsd = tokensAmount * collateral.priceUsd

  const formattedTokensAmount = isExponentialNotation(tokensAmount)
    ? convertToDecimalString(tokensAmount)
    : formatCollateralTokenValue(tokensAmount)

  return (
    <div className={styles.tokensListItemBalanceInfo}>
      <span className={styles.tokensListItemCollateralsAmount}>{formattedTokensAmount}</span>

      {!!tokensAmountInUsd && tokensAmountInUsd > USDC_BALANCE_TRESHOLD && (
        <span className={styles.tokensListItemCollateralsAmountUsd}>
          ${formatCollateralTokenValue(tokensAmountInUsd)}
        </span>
      )}
    </div>
  )
}

export const TokensListLabels = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.tokensListLabels}>
      <span className={styles.tokenListLabel}>Token</span>
      {connected && <span className={styles.tokenListLabel}>Available</span>}
    </div>
  )
}

interface PinnedTokensListProps {
  onChange: (token: BaseToken) => void
  tokensList: BaseToken[]
}

export const PinnedTokensList: FC<PinnedTokensListProps> = ({ onChange, tokensList }) => {
  return (
    <div className={styles.pinnedTokensList}>
      {tokensList.map((token) => (
        <div
          key={token.collateral.mint}
          onClick={() => onChange(token)}
          className={styles.pinnedToken}
        >
          <ResponsiveImage src={token.collateral.logoUrl} className={styles.pinnedTokenIcon} />
          <span className={styles.pinnedTokenLabel}>{token.collateral.ticker}</span>
        </div>
      ))}
    </div>
  )
}
