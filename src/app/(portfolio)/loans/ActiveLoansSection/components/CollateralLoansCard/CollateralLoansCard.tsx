import { FC, useMemo } from 'react'

import classNames from 'classnames'
import _ from 'lodash'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { ChevronDown, Coin, CoinPlus, SOLFilled, USDC } from '@banx/icons'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'
import { formatCompact } from '@banx/utils/common'
import { getTokenLoanSupply } from '@banx/utils/core'
import { getOracleIcon, getTokenDecimals, isUsdcTokenType } from '@banx/utils/tokens'

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

  const totalCollateralAmount = useMemo(() => {
    return _.sumBy(loansPreview.loans, (loan) => getTokenLoanSupply(loan))
  }, [loansPreview])

  const formattedTotalCollateralAmount = formatCompact(totalCollateralAmount.toString(), 2)
  const totalCollateralPrice = totalCollateralAmount * collateralPrice

  const Icon = isUsdcTokenType(lendingToken) ? USDC : SOLFilled

  return (
    <div className={styles.mainInfoContainer}>
      <div className={styles.collateralImageWrapper}>
        <ResponsiveImage src={collateralLogoUrl} className={styles.collateralImage} />
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
      <Tooltip label={`Price feed from the ${_.capitalize(oraclePriceFeedType)} oracle`}>
        {getOracleIcon(oraclePriceFeedType)}
      </Tooltip>
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
    collateralPrice,
    totalDebt,
    weightedLtv,
    weightedApr,
    terminatingLoansAmount,
    repaymentCallsAmount,
    lendingToken,
  } = loansPreview

  const tokenDecimals = getTokenDecimals(lendingToken)

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.expanded]: isExpanded })}>
      <StatInfo
        label="Price"
        value={
          <DisplayValue
            value={collateralPrice / 10 ** tokenDecimals}
            strictTokenType={lendingToken}
            isSubscriptFormat
          />
        }
        classNamesProps={classNamesProps}
        tooltipText={TOOLTIP_TEXTS.PRICE}
      />

      <StatInfo
        label="Total debt"
        value={<DisplayValue value={totalDebt} strictTokenType={lendingToken} />}
        tooltipText={TOOLTIP_TEXTS.PRICE}
        classNamesProps={classNamesProps}
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
            terminatingLoansAmount={terminatingLoansAmount}
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
  repaymentCallsAmount: number
}

const LoansStatus: FC<LoansStatusProps> = ({ terminatingLoansAmount, repaymentCallsAmount }) => {
  return (
    <div className={styles.loansStatus}>
      <Tooltip label="Terminating loans">
        <div className={styles.loansStatusIcon}>
          <CoinPlus />
          <span>{terminatingLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip label="Repayment calls">
        <div className={styles.loansStatusIcon}>
          <Coin />
          <span>{repaymentCallsAmount}</span>
        </div>
      </Tooltip>
    </div>
  )
}
