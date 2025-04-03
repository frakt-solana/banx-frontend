import { FC } from 'react'

import { BN } from 'fbonds-core'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { CollateralToken } from '@banx/api/tokens'
import { adjustTokenAmountWithUpfrontFee } from '@banx/utils'

import { getSummaryInfo } from './helpers'
import { BorrowOffer } from './hooks'

import styles from './InstantBorrowContent.module.scss'

interface SummaryProps {
  offer: BorrowOffer | null
  collateral: CollateralToken | undefined
}

export const Summary: FC<SummaryProps> = ({ offer, collateral }) => {
  const { upfrontFee, aprRate, weeklyFee, collateralUpfrontFee } = getSummaryInfo(offer, collateral)

  const statClassNames = {
    value: styles.fixedStatValue,
  }

  const receiveAmount = adjustTokenAmountWithUpfrontFee(
    new BN(offer?.maxTokenToGet || 0),
    new BN(collateralUpfrontFee),
  )

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Receive"
        value={<DisplayValue value={receiveAmount.toNumber()} />}
        classNamesProps={statClassNames}
        tooltipText="This is the actual amount you can receive based on your available collateral and the selected LTV ratio"
        flexType="row"
      />
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        tooltipText={`${
          collateralUpfrontFee / 100
        }% upfront fee charged on the loan principal amount, paid when loan is funded`}
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Est weekly fee"
        value={<DisplayValue value={weeklyFee} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="APR"
        value={aprRate / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        tooltipText="An annual percentage rate that accounts for different loan amounts and their respective interest rates, providing a comprehensive view of the overall interest cost"
        flexType="row"
      />
    </div>
  )
}
