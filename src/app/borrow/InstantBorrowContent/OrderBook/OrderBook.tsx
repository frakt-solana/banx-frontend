'use client'

import { FC, useCallback, useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import {
  adjustTokenAmountWithUpfrontFee,
  bnToHuman,
  getTokenDecimals,
  stringToBN,
} from '@banx/utils'

import { updateOfferBasedOnBorrow } from '../helpers'
import { BorrowOffer, useSortedOffers } from '../hooks'
import { useBorrowStore } from '../hooks/useBorrowStore'
import { useSelectedOffer } from '../hooks/useSelectedOffers'
import { getTableColumns } from './columns'

import styles from './OrderBook.module.scss'

interface OrderBookProps {
  offers: BorrowOffer[]
  borrowInputValue: string
  collateral: CollateralToken | undefined
  loading: boolean
}

const OrderBook: FC<OrderBookProps> = ({
  offers: rawOffers,
  borrowInputValue,
  collateral,
  loading,
}) => {
  const { tokenType } = useTokenType()
  const { setLtvSlider, setBorrowInputValue, setCollateralInputValue } = useBorrowStore()
  const { selectedOffer, setSelectedOffer, clearSelection, getSelectedOffer } = useSelectedOffer()

  const tokenDecimals = getTokenDecimals(tokenType)

  const { offers, onChangeSortOption, selectedSortOption } = useSortedOffers(rawOffers)

  useEffect(() => {
    if (loading || !collateral || offers.length === 0) return

    const selectedOffer = getSelectedOffer()
    const currentOffer =
      offers.find((offer) => offer.publicKey === selectedOffer?.publicKey) || offers[0]

    const updatedOffer = updateOfferBasedOnBorrow({
      collateral,
      offer: currentOffer,
      tokenDecimals,
      borrowAmount: stringToBN(borrowInputValue, tokenDecimals),
    })

    //? Update LTV values if the offer changes
    if (updatedOffer && updatedOffer?.publicKey !== selectedOffer?.publicKey) {
      const maxAvailableLtv = updatedOffer.maxLtv / 100
      setLtvSlider(Math.min(maxAvailableLtv, 100))
    }

    return setSelectedOffer(updatedOffer)
  }, [
    borrowInputValue,
    collateral,
    tokenDecimals,
    offers,
    setSelectedOffer,
    setLtvSlider,
    getSelectedOffer,
    loading,
  ])

  //? Clear current selection and reset input values when token type or collateral changes
  useEffect(() => {
    clearSelection()
    setBorrowInputValue('0')
    setCollateralInputValue('0')
  }, [clearSelection, tokenType, collateral, setBorrowInputValue, setCollateralInputValue])

  const onRowClick = useCallback(
    (offer: BorrowOffer) => {
      if (!collateral || selectedOffer?.publicKey === offer.publicKey) return

      const upfrontFee = new BN(collateral.collateral.upfrontFee)
      const adjustedMaxBorrowable = adjustTokenAmountWithUpfrontFee(offer.maxBorrow, upfrontFee)

      const maxAvailableBorrowAmount = bnToHuman(adjustedMaxBorrowable, tokenDecimals)
      const maxAvailableLtv = offer.maxLtv / 100

      const updatedOffer = updateOfferBasedOnBorrow({
        offer,
        collateral,
        tokenDecimals,
        borrowAmount: stringToBN(borrowInputValue, tokenDecimals),
      })

      setBorrowInputValue(maxAvailableBorrowAmount.toString())
      setLtvSlider(Math.min(maxAvailableLtv, 100))

      return setSelectedOffer(updatedOffer)
    },
    [
      collateral,
      selectedOffer,
      tokenDecimals,
      borrowInputValue,
      setBorrowInputValue,
      setLtvSlider,
      setSelectedOffer,
    ],
  )

  const columns = getTableColumns({
    collateral,
    selectedOffer,
    onSort: onChangeSortOption,
    selectedSortOption,
  })

  const rowParams = useMemo(() => {
    return { onRowClick }
  }, [onRowClick])

  const hasOffers = offers.length > 0
  const isLoading = !hasOffers && loading

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        loading={isLoading}
        loaderClassName={styles.loader}
        emptyMessage={
          hasOffers ? undefined : (
            <EmptyList message="There are no available offers at the moment" />
          )
        }
      />
    </div>
  )
}

export default OrderBook
