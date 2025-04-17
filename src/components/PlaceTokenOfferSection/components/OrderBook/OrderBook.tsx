import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { Loader } from '@banx/components/Loader'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { OfferPreview } from '@banx/api'

import { Offer } from './Offer'
import { useMarketOrders } from './hooks'

import styles from './OrderBook.module.scss'

export interface OrderBookProps {
  market: OfferPreview['tokenMarketPreview'] | undefined
  lendingToken: LendingTokenType
  offerPubkey?: string
  className?: string
}

const OrderBook: FC<OrderBookProps> = ({ market, lendingToken, offerPubkey = '', className }) => {
  const { marketPubkey = '' } = market ?? {}

  const { offers, isLoading } = useMarketOrders(marketPubkey, offerPubkey, lendingToken)

  return (
    <div className={classNames(styles.orderBook, className)}>
      <div className={styles.labelsWrapper}>
        {_.map(MARKET_LABELS, (label, key) => (
          <Label key={key} title={label.title} tooltip={label.tooltip} />
        ))}
      </div>

      <ul className={styles.offersList}>
        {isLoading && <Loader size="small" />}

        {!isLoading &&
          offers.map((offer) => {
            const offerPubkey = offer.publicKey.toBase58()

            return <Offer key={offerPubkey} offer={offer} lendingToken={lendingToken} />
          })}
      </ul>
    </div>
  )
}

export default OrderBook

interface LabelConfig {
  title: string
  tooltip: string
}

const Label = ({ title, tooltip }: LabelConfig) => (
  <div className={styles.labelWrapper}>
    <span className={styles.label}>{title}</span>
    {tooltip && <Tooltip label={tooltip} />}
  </div>
)

const MARKET_LABELS = {
  price: {
    title: 'Offer LTV',
    tooltip: 'The LTV ratio defined by the lender for this offer',
  },
  ltv: {
    title: 'Liquidation LTV',
    tooltip: 'The maximum LTV ratio allowed. If exceeded, the collateral will be liquidated',
  },
  apr: {
    title: 'APR',
    tooltip: 'A fixed annual interest rate set by the lender for this loan offer',
  },
  size: {
    title: 'Size',
    tooltip: 'The total amount available to lend at the given price',
  },
}
