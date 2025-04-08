import { FC } from 'react'

import { capitalize, isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { DexscreenerLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { MarketTokenRewards, core } from '@banx/api'
import { useMarketTokenRewards } from '@banx/hooks'
import { Fire, StarSecondary } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { formatTokensPerCollateral } from '@banx/utils/core'
import { getOracleIcon, getTokenDecimals } from '@banx/utils/tokens'

import styles from './LendTokenCard.module.scss'

interface LendTokenCardProps {
  market: core.TokenMarketPreview
  onClick: () => void
}

const LendTokenCard: FC<LendTokenCardProps> = ({ market, onClick }) => {
  const { marketRewards } = useMarketTokenRewards(market.marketPubkey)

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardBody}>
        <MarketMainInfo market={market} marketRewards={marketRewards} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo market={market} />
          <Button size="medium" className={styles.placeOfferButton}>
            Place
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LendTokenCard

interface MarketMainInfoProps {
  market: core.TokenMarketPreview
  marketRewards?: MarketTokenRewards
}

const MarketMainInfo: FC<MarketMainInfoProps> = ({ market, marketRewards }) => {
  const isOracleMarket = market.oraclePriceFeedType !== 'none'

  return (
    <div className={styles.mainInfoContainer}>
      <ResponsiveImage src={market.collateral.logoUrl} className={styles.collateralImage} />
      <h4 className={styles.collateralName}>{market.collateral.ticker}</h4>

      <div className={styles.marketLinks}>
        <DexscreenerLink mint={market.collateral.mint} />
        {market.isHot && (
          <Tooltip title="Market is in a huge demand and waiting for lenders!">
            <Fire />
          </Tooltip>
        )}

        {!isEmpty(marketRewards) && (
          <Tooltip title={marketRewards.description}>
            <StarSecondary />
          </Tooltip>
        )}

        {isOracleMarket && (
          <Tooltip title={`Price feed from the ${capitalize(market.oraclePriceFeedType)} oracle`}>
            {getOracleIcon(market.oraclePriceFeedType)}
          </Tooltip>
        )}
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.TokenMarketPreview
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market }) => {
  const {
    collateralPrice,
    bestOffer,
    loansTvl,
    offersTvl,
    activeLoansAmount,
    activeOffersAmount,
    marketApr,
  } = market

  const { tokenType } = useTokenType()
  const decimals = getTokenDecimals(tokenType)

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  const formattedBestOffer = parseFloat(formatTokensPerCollateral(bestOffer, decimals))
  const ltvPercent = (formattedBestOffer / (collateralPrice / 10 ** decimals)) * 100

  return (
    <div className={styles.additionalInfoStats}>
      <StatInfo
        label="Price"
        value={<DisplayValue value={collateralPrice / 10 ** decimals} isSubscriptFormat />}
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Top offer"
        value={<DisplayValue value={formattedBestOffer} isSubscriptFormat />}
        secondValue={ltvPercent ? <>{createPercentValueJSX(ltvPercent)} LTV</> : undefined}
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`${activeLoansAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Size"
        value={<DisplayValue value={offersTvl} />}
        secondValue={`${activeOffersAmount} offers`}
        tooltipText="Liquidity that is locked in active offers"
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Avg APR"
        value={marketApr}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Average interest rate across offers"
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
    </div>
  )
}
