import { FC, JSX } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import {
  DisplayValue,
  createDisplayValueJSX,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { TokenOfferPreview } from '@banx/api'
import { Pencil } from '@banx/icons'
import { SyntheticTokenOffer } from '@banx/store'
import {
  calcOfferLtvPercent,
  formatTokensPerCollateral,
  getTokenDecimals,
  getTokenUnit,
} from '@banx/utils'

import styles from './OrderBook.module.scss'

interface OfferProps {
  offer: SyntheticTokenOffer
  market: TokenOfferPreview['tokenMarketPreview'] | undefined
  lendingToken: LendingTokenType
}

export const Offer: FC<OfferProps> = ({ offer, market, lendingToken }) => {
  const { collateralsPerToken, offerSize, apr } = offer
  const { collateral, collateralPrice = 0 } = market ?? {}

  const lendingTokenDecimals = getTokenDecimals(lendingToken)
  const collateralTokenDecimals = collateral?.decimals || 0
  const lendingTokenUnit = getTokenUnit(lendingToken)

  const tokensPerCollateral = formatTokensPerCollateral(
    calculateTokensPerCollateralFloat(
      collateralsPerToken,
      collateralTokenDecimals,
      lendingTokenDecimals,
    ),
    lendingTokenDecimals,
  )

  const ltvPercent = calcOfferLtvPercent({
    tokensPerCollateral: parseFloat(tokensPerCollateral),
    collateralPrice,
    lendingTokenDecimals,
  })

  return (
    <OfferView
      offer={offer}
      values={[
        {
          value: createDisplayValueJSX(tokensPerCollateral.toString(), lendingTokenUnit),
          showBadge: true,
        },
        { value: createPercentValueJSX(ltvPercent, '0%') },
        { value: createPercentValueJSX(apr, '0%') },
        { value: <DisplayValue value={offerSize} strictTokenType={lendingToken} /> },
      ]}
    />
  )
}

export const OracleOffer: FC<OfferProps> = ({ offer, lendingToken }) => {
  const { offerSize, apr, liquidationLtv, offerLtv } = offer

  return (
    <OfferView
      offer={offer}
      values={[
        { value: createPercentValueJSX(offerLtv, '0%'), showBadge: true },
        { value: createPercentValueJSX(liquidationLtv, '0%') },
        { value: createPercentValueJSX(apr, '0%') },
        { value: <DisplayValue value={offerSize} strictTokenType={lendingToken} /> },
      ]}
    />
  )
}

interface OfferViewProps {
  offer: SyntheticTokenOffer
  values: {
    value: string | JSX.Element
    showBadge?: boolean
  }[]
}

const OfferView: FC<OfferViewProps> = ({ offer, values }) => {
  const { publicKey: offerPubkey, isEdit } = offer
  const { connected, publicKey } = useWallet()

  const isNewOffer = connected && offerPubkey.toBase58() === PUBKEY_PLACEHOLDER
  const isOwner = publicKey?.toBase58() === offer.assetReceiver
  const showOwnerBadge = isOwner && !isNewOffer && !isEdit

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  return (
    <li className={classNames(styles.offerListItem, commonHighlightClassNames)}>
      <div className={classNames(styles.offerHighlightIndicator, commonHighlightClassNames)}>
        <Pencil />
      </div>
      <div className={styles.offerDetailsContainer}>
        {values.map(({ value, showBadge }, index) => (
          <span
            key={index}
            className={classNames(styles.commonValue, {
              [styles.showOwnerBadge]: showBadge && showOwnerBadge,
            })}
          >
            {value}
          </span>
        ))}
      </div>
    </li>
  )
}
