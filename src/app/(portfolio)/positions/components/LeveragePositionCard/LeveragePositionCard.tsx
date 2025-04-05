import { FC } from 'react'

import { useConnection } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { SellToRepayModal } from '@banx/components/modals'

import { TokenLoan } from '@banx/api'
import {
  useCollateralConversionRate,
  useCollateralYield,
  useMultiplyPair,
} from '@banx/app/multiply/[ticker]/hooks'
import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { useModal, useSlippage } from '@banx/store/common'
import { caclulateBorrowTokenLoanValue, formatCompact, getTokenLoanSupply } from '@banx/utils'

import { TOOLTIP_TEXTS } from '../../constants'
import { calculateNetAprByLoan } from '../../helpers'

import styles from './LeveragePositionCard.module.scss'

type LeveragePositionCardProps = {
  loan: TokenLoan
}

const LeveragePositionCard: FC<LeveragePositionCardProps> = ({ loan }) => {
  const { pair, isLoading: isPairLoading } = useMultiplyPair(loan.collateral.mint)

  const { open } = useModal()

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <PositionMainInfo loan={loan} />

        <div className={styles.additionalContentWrapper}>
          {isPairLoading && <SkeletonPositionAdditionalInfo />}
          {!isPairLoading && pair && <PositionAdditionalInfo loan={loan} pair={pair} />}

          <Button
            onClick={(event) => {
              if (!pair) return
              open(SellToRepayModal, { loan, pair })
              event.stopPropagation()
            }}
            variant="secondary"
            size="medium"
            className={styles.exitButton}
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LeveragePositionCard

const PositionMainInfo: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const { ticker: collareralTicker = '', logoUrl: collateralLogoUrl = '' } = loan.collateral

  const collateralSupply = getTokenLoanSupply(loan)

  const formattedTotalCollateralAmount = formatCompact(collateralSupply.toString(), 2)
  const totalCollateralPrice = collateralSupply * loan.collateralPrice

  return (
    <div className={styles.mainInfoContainer}>
      <ResponsiveImage src={collateralLogoUrl} className={styles.collateralImage} />
      <div className={styles.mainInfoContent}>
        <div className={styles.mainInfoContentRow}>
          <span>{formattedTotalCollateralAmount}</span>
          <span>{collareralTicker}</span>
        </div>
        <span className={styles.collateralPrice}>
          <DisplayValue
            strictTokenType={loan.bondTradeTransaction.lendingToken}
            value={totalCollateralPrice}
          />
        </span>
      </div>
    </div>
  )
}

const PositionAdditionalInfo: FC<{ loan: TokenLoan; pair: MultiplyPair }> = ({ loan, pair }) => {
  const { connection } = useConnection()
  const { slippageBps } = useSlippage()

  const { rate: conversionRate } = useCollateralConversionRate({
    pair,
    collateralDecimals: loan.collateral.decimals,
    mode: 'sellToRepay',
    slippageBps,
    connection,
  })

  const { collateralYield } = useCollateralYield(pair)

  const loanPnl = loan.pnl ?? 0
  const leverage = loan.fraktBond.leverageBasePoints / BASE_POINTS / 100
  const totalDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const netApr = calculateNetAprByLoan(loan, conversionRate, collateralYield)

  const collateralSupply = getTokenLoanSupply(loan)
  const formattedTotalCollateralAmount = formatCompact((collateralSupply / leverage).toString(), 2)

  const positionCreatedAt = loan.fraktBond.activatedAt

  const isNegativePnl = loanPnl < 0
  const isNegativeNetApr = netApr < 0

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={styles.additionalInfoStats}>
      <StatInfo
        label="Leverage"
        value={`x${leverage}`}
        classNamesProps={{ ...classNamesProps, value: styles.leverageStat }}
      />

      <StatInfo
        label="Collateral"
        value={`${formattedTotalCollateralAmount} ${pair.collateralTicker}`}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Debt"
        value={
          <DisplayValue
            strictTokenType={loan.bondTradeTransaction.lendingToken}
            value={totalDebt}
          />
        }
        tooltipText={TOOLTIP_TEXTS.DEBT}
        classNamesProps={{ ...classNamesProps, value: styles.debtStat }}
      />

      <StatInfo
        label="Net APR"
        value={netApr.toFixed(1)}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText={TOOLTIP_TEXTS.APR}
        classNamesProps={{
          ...classNamesProps,
          value: classNames(styles.additionalAprStat, { [styles.negative]: isNegativeNetApr }),
        }}
      />

      <StatInfo
        label="Created"
        value={moment.unix(positionCreatedAt).fromNow()}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="PNL"
        value={
          <span>
            {isNegativePnl ? '' : '+'}
            <DisplayValue
              strictTokenType={loan.bondTradeTransaction.lendingToken}
              value={loanPnl}
            />
          </span>
        }
        classNamesProps={{
          ...classNamesProps,
          value: classNames(styles.pnlStat, { [styles.negative]: isNegativePnl }),
        }}
      />
    </div>
  )
}

const SkeletonPositionAdditionalInfo = () => (
  <div className={styles.skeletonAdditionalInfoStats}>
    {Array.from({ length: 6 }, (_, index) => (
      <StatInfo
        key={index}
        value={<Skeleton.Button active className={classNames(styles.skeletonStat)} />}
        classNamesProps={{ container: styles.additionalInfoStat }}
      />
    ))}
  </div>
)
