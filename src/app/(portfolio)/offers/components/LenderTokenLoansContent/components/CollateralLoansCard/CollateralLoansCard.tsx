import { FC, useMemo } from 'react'

import classNames from 'classnames'
import { capitalize, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { ChevronDown, CoinCrashed, CoinPlus, SOLFilled, USDC, Warning } from '@banx/icons'
import {
  HealthColorIncreasing,
  formatCompact,
  getColorByPercent,
  getOracleIcon,
  getTokenLoanSupply,
  isUsdcTokenType,
} from '@banx/utils'

import { TOOLTIP_TEXTS } from '../../constants'
import { LoansPreview } from '../../types'
import ExpandedCardContent from '../ExpandedCardContent'

import styles from './CollateralLoansCard.module.scss'

interface CollateralLoansCardProps {
  loansPreview: LoansPreview
  onClick: () => void
  isExpanded: boolean
}

const CollateralLoansCard: FC<CollateralLoansCardProps> = ({
  loansPreview,
  onClick,
  isExpanded,
}) => {
  return (
    <div className={styles.card}>
      <div
        onClick={onClick}
        className={classNames(styles.cardBody, { [styles.expanded]: isExpanded })}
      >
        <CollateralLoansMainInfo loansPreview={loansPreview} />

        <div className={styles.additionalContentWrapper}>
          <CollateralLoansAdditionalInfo loansPreview={loansPreview} isExpanded={isExpanded} />

          <Button
            type="circle"
            size="medium"
            className={classNames(styles.expandButton, { [styles.expanded]: isExpanded })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isExpanded && <ExpandedCardContent loans={loansPreview.loans} />}
    </div>
  )
}

export default CollateralLoansCard

const CollateralLoansMainInfo: FC<{ loansPreview: LoansPreview }> = ({ loansPreview }) => {
  const {
    collateralTicker,
    collateralLogoUrl,
    collateralPrice,
    lendingToken,
    oraclePriceFeedType,
  } = loansPreview

  const isOracleMarket = oraclePriceFeedType !== 'none'

  const totalCollateralAmount = useMemo(() => {
    return sumBy(loansPreview.loans, (loan) => getTokenLoanSupply(loan))
  }, [loansPreview])

  const formattedTotalCollateralAmount = formatCompact(totalCollateralAmount.toString(), 2)
  const totalCollateralPrice = totalCollateralAmount * collateralPrice

  const Icon = isUsdcTokenType(lendingToken) ? USDC : SOLFilled

  return (
    <div className={styles.mainInfoContainer}>
      <div className={styles.collateralImageWrapper}>
        <img src={collateralLogoUrl} className={styles.collateralImage} />
        <Icon className={styles.lendingTokenImage} />
      </div>
      <div className={styles.mainInfoContent}>
        <div className={styles.mainInfoContentRow}>
          <span>{formattedTotalCollateralAmount}</span>
          <span>{collateralTicker}</span>
        </div>
        <span className={styles.collateralPrice}>
          <DisplayValue value={totalCollateralPrice} strictTokenType={lendingToken} />
        </span>
      </div>
      {isOracleMarket && (
        <Tooltip title={`Price feed from the ${capitalize(oraclePriceFeedType)} oracle`}>
          {getOracleIcon(oraclePriceFeedType)}
        </Tooltip>
      )}
    </div>
  )
}

interface CollateralLoansAdditionalInfoProps {
  loansPreview: LoansPreview
  isExpanded: boolean
}

const CollateralLoansAdditionalInfo: FC<CollateralLoansAdditionalInfoProps> = ({
  loansPreview,
  isExpanded,
}) => {
  const {
    totalClaim,
    totalRepaid,
    weightedLtv,
    weightedApr,
    terminatingLoansAmount,
    underwaterLoansAmount,
    liquidatedLoansAmount,
    lendingToken,
  } = loansPreview

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.expanded]: isExpanded })}>
      <StatInfo
        label="Claim"
        value={<DisplayValue value={totalClaim} strictTokenType={lendingToken} />}
        classNamesProps={classNamesProps}
        tooltipText={TOOLTIP_TEXTS.CLAIM}
      />

      <StatInfo
        label="WLTV"
        value={weightedLtv}
        valueStyles={{ color: getColorByPercent(weightedLtv, HealthColorIncreasing) }}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText={TOOLTIP_TEXTS.WLTV}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Repaid"
        value={<DisplayValue value={totalRepaid} strictTokenType={lendingToken} />}
        tooltipText={TOOLTIP_TEXTS.REPAID}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="WAPR"
        value={weightedApr}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText={TOOLTIP_TEXTS.WAPR}
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />

      <StatInfo
        label="Status"
        value={
          <LoansStatus
            liquidatedLoansAmount={liquidatedLoansAmount}
            terminatingLoansAmount={terminatingLoansAmount}
            underwaterLoansAmount={underwaterLoansAmount}
          />
        }
        classNamesProps={classNamesProps}
      />
    </div>
  )
}

interface LoansStatusProps {
  liquidatedLoansAmount: number
  terminatingLoansAmount: number
  underwaterLoansAmount: number
}

const LoansStatus: FC<LoansStatusProps> = ({
  liquidatedLoansAmount,
  terminatingLoansAmount,
  underwaterLoansAmount,
}) => {
  return (
    <div className={styles.loansStatus}>
      <Tooltip title="Liquidated loans">
        <div className={styles.loansStatusIcon}>
          <CoinCrashed />
          <span>{liquidatedLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Terminating loans">
        <div className={styles.loansStatusIcon}>
          <Warning />
          <span>{terminatingLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Underwater loans">
        <div className={styles.loansStatusIcon}>
          <CoinPlus />
          <span>{underwaterLoansAmount}</span>
        </div>
      </Tooltip>
    </div>
  )
}
