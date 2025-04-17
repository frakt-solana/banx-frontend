import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Pencil } from '@banx/icons'
import { SyntheticTokenOffer } from '@banx/store'

import styles from './OrderBook.module.scss'

interface OfferProps {
  offer: SyntheticTokenOffer
  lendingToken: LendingTokenType
}

export const Offer: FC<OfferProps> = ({ offer, lendingToken }) => {
  const { publicKey: offerPubkey, isEdit, offerSize, apr, liquidationLtv, offerLtv } = offer
  const { connected, publicKey } = useWallet()

  const isNewOffer = connected && offerPubkey.toBase58() === PUBKEY_PLACEHOLDER
  const isOwner = publicKey?.toBase58() === offer.assetReceiver
  const showOwnerBadge = isOwner && !isNewOffer && !isEdit

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const values = [
    { value: createPercentValueJSX(offerLtv, '0%'), showBadge: true },
    { value: createPercentValueJSX(liquidationLtv, '0%') },
    { value: createPercentValueJSX(apr, '0%') },
    { value: <DisplayValue value={offerSize} strictTokenType={lendingToken} /> },
  ]

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
