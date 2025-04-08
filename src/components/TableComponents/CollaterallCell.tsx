import { FC, ReactNode } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOLFilled, USDC } from '@banx/icons'
import { formatCompact } from '@banx/utils/common'
import { isUsdcTokenType } from '@banx/utils/tokens'

import Checkbox from '../Checkbox'
import { ResponsiveImage } from '../ResponsiveImage'
import { DisplayValue } from './helpers'

import styles from './TableCells.module.scss'

interface CollateralTokenCellProps {
  amount: number

  logoUrl?: string
  ticker?: string
  collateralPrice?: number

  selected?: boolean
  onCheckboxClick?: () => void
  checkboxClassName?: string

  lendingToken?: LendingTokenType
  showLendingTokenIcon?: boolean

  rightContentJSX?: ReactNode
  className?: string
}

export const CollateralTokenCell: FC<CollateralTokenCellProps> = ({
  amount,
  logoUrl,
  ticker,
  selected = false,
  onCheckboxClick,
  checkboxClassName,
  className,
  lendingToken,
  showLendingTokenIcon,
  rightContentJSX,
  collateralPrice = 0,
}) => {
  const shouldShowLogos = logoUrl || (lendingToken && showLendingTokenIcon)
  const formattedAmount = amount ? formatCompact(amount.toString(), 2) : null
  const totalValue = collateralPrice > 0 && amount > 0 ? collateralPrice * amount : 0

  return (
    <div className={styles.collateralTokenCell}>
      {onCheckboxClick && (
        <Checkbox
          className={classNames(styles.checkbox, checkboxClassName)}
          onChange={onCheckboxClick}
          checked={selected}
        />
      )}

      <div className={classNames(styles.collateralTokenCellСontent, className)}>
        {shouldShowLogos && (
          <div className={styles.collateralImageWrapper}>
            <TokenLogo logoUrl={logoUrl} />
            <LendingTokenLogo lendingToken={lendingToken} showIcon={showLendingTokenIcon} />
          </div>
        )}

        <div className={styles.collateralTokenMainInfo}>
          <div className={styles.collateralTokenMainInfoRow}>
            {formattedAmount && <span>{formattedAmount}</span>}
            {ticker && <span>{ticker}</span>}
          </div>
          {totalValue > 0 && (
            <span className={styles.collateralTokenPrice}>
              <DisplayValue value={totalValue} strictTokenType={lendingToken} />
            </span>
          )}
        </div>

        {rightContentJSX}
      </div>
    </div>
  )
}

interface TokenLogoProps {
  logoUrl?: string
  altText?: string
  className?: string
}

const TokenLogo: FC<TokenLogoProps> = ({ logoUrl, altText, className }) => {
  if (!logoUrl) return null
  return (
    <ResponsiveImage
      src={logoUrl}
      alt={altText}
      className={classNames(styles.tokenLogo, className)}
    />
  )
}

interface LendingTokenLogoProps {
  lendingToken: LendingTokenType | undefined
  showIcon?: boolean
}

const LendingTokenLogo: FC<LendingTokenLogoProps> = ({ lendingToken, showIcon }) => {
  if (!lendingToken || !showIcon) return null

  return isUsdcTokenType(lendingToken) ? (
    <USDC className={styles.lendingTokenLogo} />
  ) : (
    <SOLFilled className={styles.lendingTokenLogo} />
  )
}
