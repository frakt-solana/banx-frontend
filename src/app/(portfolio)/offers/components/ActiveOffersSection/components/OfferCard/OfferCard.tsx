import { FC } from 'react'

import classNames from 'classnames'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { capitalize } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { DexscreenerLink } from '@banx/components/SolanaLinks'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { TokenOfferPreview, core } from '@banx/api'
import { ChevronDown, Coin, CoinPlus, SOLFilled, USDC, Warning } from '@banx/icons'
import { convertToSynthetic, useSyntheticTokenOffers } from '@banx/store'
import {
  HealthColorIncreasing,
  ZERO_BN,
  bnToNumberSafe,
  calcOfferLtvPercent,
  formatTokensPerCollateral,
  getColorByPercent,
  getLendingTokenFromBondingCurve,
  getOracleIcon,
  getTokenDecimals,
  isUsdcTokenType,
} from '@banx/utils'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './OfferCard.module.scss'

interface OfferCardProps {
  offerPreview: TokenOfferPreview
  isOpen: boolean
  onToggleCard: () => void
}

export const OfferCard: FC<OfferCardProps> = ({ offerPreview, isOpen, onToggleCard }) => {
  const { setOffer: setSyntheticOffer } = useSyntheticTokenOffers()

  const lendingToken = getLendingTokenFromBondingCurve(
    offerPreview.bondOffer.bondingCurve.bondingType,
  )

  const onCardClick = () => {
    onToggleCard()
    setSyntheticOffer(convertToSynthetic(offerPreview.bondOffer, true))
  }

  return (
    <div className={styles.card}>
      <div
        className={classNames(styles.cardBody, { [styles.opened]: isOpen })}
        onClick={onCardClick}
      >
        <MarketMainInfo offerPreview={offerPreview} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo offerPreview={offerPreview} isOpen={isOpen} />
          <Button
            type="circle"
            size="medium"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && (
        <ExpandedCardContent
          market={offerPreview.tokenMarketPreview}
          lendingToken={lendingToken}
          offerPubkey={offerPreview.publicKey}
        />
      )}
    </div>
  )
}

const MarketMainInfo: FC<{ offerPreview: core.TokenOfferPreview }> = ({ offerPreview }) => {
  const { collateral } = offerPreview.tokenMarketPreview

  const isOracleMarket = collateral.oraclePriceFeedType !== 'none'
  const lendingToken = getLendingTokenFromBondingCurve(
    offerPreview.bondOffer.bondingCurve.bondingType,
  )

  const Icon = isUsdcTokenType(lendingToken) ? USDC : SOLFilled

  return (
    <div className={styles.mainInfoContainer}>
      <div className={styles.collateralImageWrapper}>
        <ResponsiveImage src={collateral.logoUrl} className={styles.collateralImage} />
        <Icon className={styles.lendingTokenImage} />
      </div>
      <h4 className={styles.collateralName}>{collateral.ticker}</h4>
      <div className={styles.marketLinks}>
        <DexscreenerLink mint={offerPreview.tokenMarketPreview.collateral.mint} />
        {isOracleMarket && (
          <Tooltip
            title={`Price feed from the ${capitalize(collateral.oraclePriceFeedType)} oracle`}
          >
            {getOracleIcon(collateral.oraclePriceFeedType)}
          </Tooltip>
        )}
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  offerPreview: core.TokenOfferPreview
  isOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ offerPreview, isOpen }) => {
  const { bondOffer, tokenOfferPreview, tokenMarketPreview } = offerPreview
  const {
    inLoans,
    offerSize,
    terminatingLoansAmount,
    liquidatedLoansAmount,
    repaymentCallsAmount,
  } = tokenOfferPreview

  const { collateral, collateralPrice } = tokenMarketPreview

  const isOracleMarket = bondOffer.offerLtvBp.gt(ZERO_BN)

  const lendingToken = getLendingTokenFromBondingCurve(bondOffer.bondingCurve.bondingType)
  const lendingTokenDecimals = getTokenDecimals(lendingToken)

  const aprPercent = offerPreview.bondOffer.loanApr.toNumber() / 100

  const tokensPerCollateral = formatTokensPerCollateral(
    calculateTokensPerCollateralFloat(
      bnToNumberSafe(offerPreview.bondOffer.validation.collateralsPerToken),
      collateral.decimals,
      lendingTokenDecimals,
    ),
    lendingTokenDecimals,
  )

  const ltvPercent = calcOfferLtvPercent({
    tokensPerCollateral: parseFloat(tokensPerCollateral),
    lendingTokenDecimals,
    collateralPrice,
  })

  const formattedPrice = collateralPrice / Math.pow(10, lendingTokenDecimals)

  const offerLtvPercent = bondOffer.offerLtvBp.toNumber() / 100

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="Price"
        value={
          <DisplayValue value={formattedPrice} strictTokenType={lendingToken} isSubscriptFormat />
        }
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      {isOracleMarket && (
        <StatInfo
          label="My offer"
          value={
            <span style={{ color: getColorByPercent(offerLtvPercent, HealthColorIncreasing) }}>
              {createPercentValueJSX(offerLtvPercent)} LTV
            </span>
          }
          classNamesProps={classNamesProps}
        />
      )}
      {!isOracleMarket && (
        <StatInfo
          label="My offer"
          value={
            <DisplayValue
              value={parseFloat(tokensPerCollateral)}
              strictTokenType={lendingToken}
              isSubscriptFormat
            />
          }
          classNamesProps={{ ...classNamesProps, value: styles.myOfferStat }}
          secondValue={
            <span style={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}>
              {createPercentValueJSX(ltvPercent)} LTV
            </span>
          }
        />
      )}
      <StatInfo
        label="In loans"
        value={<DisplayValue value={inLoans} strictTokenType={lendingToken} />}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Size"
        value={<DisplayValue value={offerSize} strictTokenType={lendingToken} />}
        tooltipText="The total amount you are willing to lend at the proposed offer price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="APR"
        value={createPercentValueJSX(aprPercent, '0%')}
        tooltipText="Maximum annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization"
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
      <StatInfo
        label="Status"
        value={
          <LoansStatus
            terminatingLoansAmount={terminatingLoansAmount}
            liquidatedLoansAmount={liquidatedLoansAmount}
            repaymentCallsAmount={repaymentCallsAmount}
          />
        }
        classNamesProps={classNamesProps}
      />
    </div>
  )
}

interface LoansStatusProps {
  terminatingLoansAmount: number
  liquidatedLoansAmount: number
  repaymentCallsAmount: number
}

const LoansStatus: FC<LoansStatusProps> = ({
  terminatingLoansAmount,
  liquidatedLoansAmount,
  repaymentCallsAmount,
}) => {
  return (
    <div className={styles.loansStatus}>
      <Tooltip title="Terminating loans">
        <div className={styles.loansStatusIcon}>
          <CoinPlus />
          <span>{terminatingLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Liquidated loans">
        <div className={styles.loansStatusIcon}>
          <Warning />
          <span>{liquidatedLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Repayment calls">
        <div className={styles.loansStatusIcon}>
          <Coin />
          <span>{repaymentCallsAmount}</span>
        </div>
      </Tooltip>
    </div>
  )
}
