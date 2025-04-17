import { FC } from 'react'

import classNames from 'classnames'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketTokenRewards, TokenMarketPreview } from '@banx/api'
import { SECONDS_IN_DAY } from '@banx/constants'
import { getTokenDecimals } from '@banx/utils/tokens'

import styles from '../PlaceTokenOfferSection.module.scss'

interface OfferSummaryProps {
  market: TokenMarketPreview | undefined
  lendingToken: LendingTokenType

  apr: number //? percent number
  offerSize: number //? normal number
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  market,
  apr,
  offerSize,
  lendingToken,
}) => {
  const { collateral } = market || {}

  const lendingTokenDecimals = getTokenDecimals(lendingToken)
  const collateralInterestFee = collateral?.interestFee || 0
  const currentTimeUnix = moment().unix()

  const borrowApr = calcBorrowerTokenAPR(apr, collateralInterestFee) || 0
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: offerSize * Math.pow(10, lendingTokenDecimals),
    startTime: currentTimeUnix,
    currentTime: currentTimeUnix + SECONDS_IN_DAY * 7,
    rateBasePoints: apr * 100,
  })

  return (
    <div className={styles.additionalSummary}>
      <StatInfo
        label="Borrow APR"
        value={borrowApr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: classNames(styles.aprValue, styles.fixedValueContent) }}
        flexType="row"
      />
      <StatInfo
        label="Est. weekly interest"
        value={<DisplayValue value={weeklyFee} strictTokenType={lendingToken} />}
        tooltipText="Expected interest on a loan over the course of a week"
        classNamesProps={{ value: styles.fixedValueContent }}
        flexType="row"
      />
    </div>
  )
}

export const ExtraRewards: FC<{ data: MarketTokenRewards }> = ({ data }) => {
  return (
    <div className={styles.extraRewards}>
      {data.rewardPrograms.map((reward, index) => (
        <StatInfo
          key={index}
          label={reward.name}
          value={reward.rewardRate}
          tooltipText={reward.details}
          classNamesProps={{ value: styles.fixedRewardsValueContent }}
          flexType="row"
        />
      ))}
    </div>
  )
}
