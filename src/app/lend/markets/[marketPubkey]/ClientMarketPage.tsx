'use client'

import { FC, useMemo } from 'react'

import classNames from 'classnames'
import _ from 'lodash'
import { useParams } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { LendTokenActivityTable } from '@banx/components/CommonTables'
import PlaceTokenOfferSection, { OrderBook } from '@banx/components/PlaceTokenOfferSection'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { DexscreenerLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Tabs, useTabs } from '@banx/components/Tabs'
import Tooltip from '@banx/components/Tooltip'

import { TokenMarketPreview } from '@banx/api'
import { PATHS, TABLET_WIDTH } from '@banx/constants'
import { useMarketTokenRewards, useTokenMarketsPreview, useWindowSize } from '@banx/hooks'
import { SOLFilled, USDC } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { getOracleIcon, getTokenDecimals, getTokenTicker, isUsdcTokenType } from '@banx/utils'

import styles from './ClientMarketPage.module.scss'

export const ClientMarketPage = () => {
  const { marketPubkey = '' } = useParams<{ marketPubkey: string }>()
  const { marketRewards } = useMarketTokenRewards(marketPubkey)

  const { marketsPreview } = useTokenMarketsPreview()

  const { tokenType } = useTokenType()

  const { width } = useWindowSize()
  const isMobile = width < TABLET_WIDTH

  const currentMarket = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const TABS = useMemo(() => {
    return isMobile ? BASE_TABS : BASE_TABS.filter((tab) => tab.value !== TabName.PLACE)
  }, [isMobile])

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: isMobile ? TabName.PLACE : TabName.OFFERS,
  })

  if (!currentMarket) return <></> //TODO: Add 404 page or redirect to markets page

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[
          { title: 'Earn', path: PATHS.LEND },
          { title: 'Markets', path: PATHS.LEND_MARKERS },
          { title: currentMarket.collateral.ticker },
        ]}
        onboardContentType="placeOffer"
      />

      <div className={styles.contentWrapper}>
        <MarketOverview market={currentMarket} />

        <div className={styles.container}>
          {!isMobile && (
            <div className={styles.placeOfferContainer}>
              <PlaceTokenOfferSection
                marketPubkey={currentMarket.marketPubkey}
                marketRewards={marketRewards}
                lendingToken={tokenType}
              />
            </div>
          )}

          <div className={styles.tabsContent}>
            <Tabs value={currentTabValue} {...tabsProps} className={styles.tabs} />
            {currentTabValue === TabName.PLACE && (
              <div className={styles.placeOfferContainerMobile}>
                <PlaceTokenOfferSection
                  marketPubkey={currentMarket.marketPubkey}
                  marketRewards={marketRewards}
                  lendingToken={tokenType}
                />
              </div>
            )}
            {currentTabValue === TabName.OFFERS && (
              <OrderBook
                lendingToken={tokenType}
                market={currentMarket}
                className={styles.orderBook}
              />
            )}
            {currentTabValue === TabName.ACTIVITY && (
              <LendTokenActivityTable
                marketPubkey={currentMarket.marketPubkey}
                className={styles.activityTable}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export enum TabName {
  PLACE = 'place',
  OFFERS = 'offers',
  ACTIVITY = 'activity',
}

const BASE_TABS = [
  {
    label: 'Place',
    value: TabName.PLACE,
  },
  {
    label: 'Offers',
    value: TabName.OFFERS,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]

const MarketOverview: FC<{ market: TokenMarketPreview }> = ({ market }) => {
  const { collateralPrice, loansTvl, offersTvl, marketApr, oraclePriceFeedType } = market

  const { tokenType } = useTokenType()
  const tokenDecimals = getTokenDecimals(tokenType)
  const tokenTicker = getTokenTicker(tokenType)
  const Icon = isUsdcTokenType(tokenType) ? USDC : SOLFilled

  const isOracleMarket = oraclePriceFeedType !== 'none'

  const classNamesProps = {
    container: styles.marketStat,
    label: styles.marketStatLabel,
    value: styles.marketStatValue,
  }

  return (
    <div className={styles.marketOverviewContainer}>
      <div className={styles.marketMainContent}>
        <div className={styles.marketImageWrapper}>
          <Icon className={styles.marketImage} />
          <ResponsiveImage
            src={market.collateral.logoUrl}
            className={classNames(styles.marketImage, styles.imageOverlap)}
          />
        </div>
        <h4 className={styles.marketName}>
          {tokenTicker}/{market.collateral.ticker}
        </h4>
        <div className={styles.marketLinks}>
          <DexscreenerLink className={styles.dexScreenerLink} mint={market.collateral.mint} />
          {isOracleMarket && (
            <Tooltip title={`Price feed from the ${_.capitalize(oraclePriceFeedType)} oracle`}>
              {getOracleIcon(oraclePriceFeedType)}
            </Tooltip>
          )}
        </div>
      </div>

      <div className={styles.marketStats}>
        <StatInfo
          label="Price"
          value={<DisplayValue value={collateralPrice / 10 ** tokenDecimals} isSubscriptFormat />}
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label="In loans"
          value={<DisplayValue value={loansTvl} />}
          tooltipText="Liquidity that is locked in active loans"
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label="Size"
          value={<DisplayValue value={offersTvl} />}
          tooltipText="Liquidity that is locked in active offers"
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label="Avg APR"
          value={marketApr}
          valueType={VALUES_TYPES.PERCENT}
          tooltipText="Average interest rate across offers"
          classNamesProps={classNamesProps}
        />
      </div>
    </div>
  )
}
