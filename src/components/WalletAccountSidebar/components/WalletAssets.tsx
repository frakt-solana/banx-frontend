import { FC } from 'react'

import { Loader } from '@banx/components/Loader'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'

import { CollateralToken } from '@banx/api'
import { useWalletTokenAssets } from '@banx/hooks'
import { bnToHuman } from '@banx/utils/bn'
import { convertToDecimalString, isExponentialNotation, shortenAddress } from '@banx/utils/common'
import { formatCollateralTokenValue } from '@banx/utils/tokens'

import styles from '../WalletAccountSidebar.module.scss'

export const WalletAssets = () => {
  const { tokens, isLoading } = useWalletTokenAssets()

  const hasData = tokens.length > 0 && !isLoading
  return (
    <div className={styles.walletAssetsContainer}>
      {isLoading && <Loader />}

      {hasData &&
        tokens.map((token) => <TokenListItem key={token.collateral.mint} token={token} />)}
    </div>
  )
}

interface TokenListItemProps {
  token: CollateralToken
}

export const TokenListItem: FC<TokenListItemProps> = ({ token }) => (
  <div className={styles.tokensListItem}>
    <div className={styles.tokensListItemInfo}>
      <ResponsiveImage src={token.collateral.logoUrl} className={styles.tokensListItemIcon} />
      <div className={styles.tokensListItemMainInfo}>
        <span className={styles.tokensListItemTicker}>{token.collateral.ticker}</span>
        <span className={styles.tokensListItemAddress}>
          {shortenAddress(token.collateral.mint)}
        </span>
      </div>
    </div>
    <TokenBalanceInfo token={token} />
  </div>
)

interface TokenBalanceInfoProps {
  token: CollateralToken
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
