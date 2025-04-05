import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { map, merge } from 'lodash'

import { Loader } from '@banx/components/Loader'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { TokenOfferPreview } from '@banx/api/tokens'

import { Offer, OracleOffer } from './Offer'
import { useMarketOrders } from './hooks'

import styles from './OrderBook.module.scss'

export interface OrderBookProps {
  market: TokenOfferPreview['tokenMarketPreview'] | undefined
  lendingToken: LendingTokenType
  offerPubkey?: string
  className?: string
}

const OrderBook: FC<OrderBookProps> = ({ market, lendingToken, offerPubkey = '', className }) => {
  const { marketPubkey = '', collateral } = market ?? {}

  const { offers, isLoading } = useMarketOrders(marketPubkey, offerPubkey, lendingToken)

  const isOracleMarket = collateral?.oraclePriceFeedType !== 'none'

  const marketLabels = getMarketLabels(isOracleMarket)

  return (
    <div className={classNames(styles.orderBook, className)}>
      <div className={styles.labelsWrapper}>
        {map(marketLabels, (label, key) => (
          <Label key={key} title={label.title} tooltip={label.tooltip} />
        ))}
      </div>

      <ul className={styles.offersList}>
        {isLoading && <Loader size="small" />}

        {!isLoading &&
          offers.map((offer) => {
            const offerPubkey = offer.publicKey.toBase58()
            const OfferComponent = isOracleMarket ? OracleOffer : Offer

            return (
              <OfferComponent
                key={offerPubkey}
                offer={offer}
                market={market}
                lendingToken={lendingToken}
              />
            )
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
    {tooltip && <Tooltip title={tooltip} />}
  </div>
)

const BASE_LABELS = {
  price: {
    title: 'Price',
    tooltip: 'The proposed price per token for lending',
  },
  ltv: {
    title: 'LTV',
    tooltip: 'The LTV ratio, which changes dynamically based on token prices',
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

const ORACLE_MARKET_LABELS = {
  price: {
    title: 'Offer LTV',
    tooltip: 'The LTV ratio defined by the lender for this offer',
  },
  ltv: {
    title: 'Liquidation LTV',
    tooltip: 'The maximum LTV ratio allowed. If exceeded, the collateral will be liquidated',
  },
}

const getMarketLabels = (isOracleMarket: boolean): Record<string, LabelConfig> =>
  isOracleMarket ? merge({}, BASE_LABELS, ORACLE_MARKET_LABELS) : BASE_LABELS
