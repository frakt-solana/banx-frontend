import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { CollateralToken } from '@banx/api/tokens'
import { adjustTokenAmountWithUpfrontFee } from '@banx/utils'

import { BorrowOffer } from '../hooks'

import styles from './OrderBook.module.scss'

interface MaxBorrowCellProps {
  selectedOffer: BorrowOffer | null
  collateral: CollateralToken | undefined
  offer: BorrowOffer
}

export const MaxBorrowCell: FC<MaxBorrowCellProps> = ({ selectedOffer, collateral, offer }) => {
  const { connected } = useWallet()

  const isOfferSelected = selectedOffer?.publicKey === offer.publicKey

  const upfrontFee = new BN(collateral?.collateral.upfrontFee || 0)
  const adjustedMaxBorrowableAmount = adjustTokenAmountWithUpfrontFee(offer.maxBorrow, upfrontFee)

  const maxAvailableLtv = Math.round(offer.maxLtv / 100)

  return (
    <div className={styles.valueWithRadio}>
      <div className={classNames(styles.radioCircle, { [styles.acitve]: isOfferSelected })} />
      <div className={styles.maxBorrowCell}>
        <span className={styles.cellTextValue}>
          {connected && <DisplayValue value={adjustedMaxBorrowableAmount.toNumber()} />}
          {!connected && <DisplayValue value={parseFloat(offer.maxTokenToGet)} />}
        </span>
        <span className={styles.ltvValue}>{createPercentValueJSX(maxAvailableLtv)} LTV</span>
      </div>
    </div>
  )
}

interface AprCellProps {
  offer: BorrowOffer
  collateral: CollateralToken | undefined
}

export const AprCell: FC<AprCellProps> = ({ offer, collateral }) => {
  const marketInterestFee = collateral?.collateral.interestFee || 0
  const aprPercent = calcBorrowerTokenAPR(parseFloat(offer.apr), marketInterestFee) / 100

  return (
    <span className={classNames(styles.cellTextValue, styles.cellTextCenter)}>
      {createPercentValueJSX(aprPercent)}
    </span>
  )
}
