import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { useParams } from 'next/navigation'

import { useCollateralsList } from '@banx/hooks'
import { useModal, useTokenType } from '@banx/store/common'
import { bnToHuman, stringToBN } from '@banx/utils/bn'
import { limitDecimalPlaces } from '@banx/utils/common'
import { adjustTokenAmountWithUpfrontFee } from '@banx/utils/core'
import { getTokenDecimals } from '@banx/utils/tokens'

import { BorrowToken } from '../../constants'
import { useBorrowTokensList } from '../../hooks'
import { WarningModal } from '../components'
import { getErrorMessage, getInitialCollateral } from '../helpers'
import { useBorrowOffers } from './useBorrowOffers'
import { useBorrowOffersTransaction } from './useBorrowOffersTransaction'
import { useBorrowStore } from './useBorrowStore'
import { useSelectedOffer } from './useSelectedOffers'

export const useInstantBorrowContent = () => {
  const params = useParams()
  const tickerParam = params.ticker

  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() ?? ''

  const { tokenType, setTokenType } = useTokenType()
  const { open: openModal } = useModal()

  const { collateralsList, isLoading: collateralsListLoading } = useCollateralsList()

  const { borrowTokensList, isLoading: borrowTokensListLoading } = useBorrowTokensList()

  const {
    collateral,
    setCollateral,
    borrowToken,
    setBorrowToken,
    ltvSliderValue,
    setLtvSlider,
    collateralInputValue,
    setCollateralInputValue,
    borrowInputValue,
    setBorrowInputValue,
  } = useBorrowStore()

  const { data: offers, isLoading: borrowOffersLoading } = useBorrowOffers()

  const { borrow, isBorrowing } = useBorrowOffersTransaction()
  const { selectedOffer } = useSelectedOffer()

  const marketTokenDecimals = getTokenDecimals(tokenType)

  const initialCollateral = useMemo(() => {
    if (!collateralsList.length) return

    return tickerParam
      ? collateralsList.find((token) => token.collateral.ticker === tickerParam)
      : getInitialCollateral(collateralsList)
  }, [collateralsList, tickerParam])

  useEffect(() => {
    if (!walletPubkey) {
      setBorrowInputValue('0')
      setCollateralInputValue('0')
      return
    }
    setCollateral(undefined)
  }, [setBorrowInputValue, setCollateral, setCollateralInputValue, walletPubkey])

  const initialBorrowToken = useMemo(
    () => borrowTokensList.find((token) => token.lendingTokenType === tokenType),
    [borrowTokensList, tokenType],
  )

  useEffect(() => {
    if (!collateral && initialCollateral) {
      setCollateral(initialCollateral)
    }
  }, [collateral, initialCollateral, setCollateral])

  useEffect(() => {
    if (!initialBorrowToken) return

    const isSameMint = collateral?.collateral.mint === initialBorrowToken.collateral.mint
    if (isSameMint) {
      setCollateral(initialCollateral!)
    }

    setBorrowToken(initialBorrowToken)
  }, [collateral, initialCollateral, setCollateral, setBorrowToken, initialBorrowToken])

  useEffect(() => {
    if (!collateral || !selectedOffer) return

    const maxCollateralAmount = new BN(selectedOffer.maxCollateralToReceive)
    const availableAmount = BN.min(collateral.amountInWallet, maxCollateralAmount)
    const totalAmountStr = bnToHuman(availableAmount, collateral.collateral.decimals).toString()

    if (totalAmountStr !== collateralInputValue) {
      setCollateralInputValue(limitDecimalPlaces(totalAmountStr, 6))
    }
  }, [selectedOffer, collateral, collateralInputValue, setCollateralInputValue])

  const maxBorrowableAmount = useMemo(() => {
    if (!selectedOffer) return

    const marketUpfrontFee = new BN(collateral?.collateral.upfrontFee || 0)

    return bnToHuman(
      adjustTokenAmountWithUpfrontFee(selectedOffer.maxBorrow, marketUpfrontFee),
      marketTokenDecimals,
    )
  }, [collateral, marketTokenDecimals, selectedOffer])

  const canFundRequiredBorrowAmount = useMemo(() => {
    if (!selectedOffer) return

    const borrowAmount = stringToBN(borrowInputValue, marketTokenDecimals)
    return new BN(selectedOffer.maxTokenToGet).gte(borrowAmount)
  }, [borrowInputValue, marketTokenDecimals, selectedOffer])

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)

    setTokenType(token.lendingTokenType)
  }

  //? Replace collateral meta if token type changes
  useEffect(() => {
    if (!collateral || !collateralsList.length) return

    const nextCollateral = collateralsList.find(
      (c) => c.collateral.mint === collateral.collateral.mint,
    )

    setCollateral(nextCollateral)
  }, [borrowToken, collateral, collateralsList, setCollateral])

  const onSubmit = () => {
    if (!selectedOffer || !collateral) return

    if (!canFundRequiredBorrowAmount) {
      return openModal(WarningModal, {
        offer: selectedOffer,
        collateral: collateral,
        onSubmit: () => borrow(selectedOffer, collateral),
      })
    }

    return borrow(selectedOffer, collateral)
  }

  const errorMessage = getErrorMessage({
    borrowToken,
    borrowInputValue,
    collateral,
  })

  const maxAvailableLtv = Math.min((selectedOffer?.maxLtv || 0) / 100, 100)

  return {
    offers,
    isLoading: borrowOffersLoading || collateralsListLoading || borrowTokensListLoading,
    selectedOffer,
    maxBorrowableAmount,

    borrowTokensList,
    collateralsList,

    borrowToken,
    borrowInputValue,
    setBorrowInputValue,
    handleBorrowTokenChange,

    collateral,
    collateralInputValue,
    setCollateral,

    maxAvailableLtv,
    ltvSliderValue,
    setLtvSlider,

    errorMessage,
    isBorrowing,
    onSubmit,
  }
}
