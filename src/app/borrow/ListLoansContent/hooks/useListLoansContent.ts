import { useEffect, useMemo, useState } from 'react'

import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { calcLenderTokenApr } from 'fbonds-core/lib/fbond-protocol/helpers'

import { CollateralToken } from '@banx/api/tokens'
import { useCollateralsList } from '@banx/hooks'
import { useTokenType } from '@banx/store'

import { BorrowToken } from '../../constants'
import { useBorrowTokensList } from '../../hooks'
import { getInputErrorMessage, getSummaryInfo } from '../helpers'
import { useListLoan } from './useListLoan'

export const useListLoansContent = () => {
  const { tokenType, setTokenType } = useTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>()

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>()

  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')
  const [liquidationLtv, setLiquidationLtv] = useState('')

  const { collateralsList } = useCollateralsList()
  const { borrowTokensList } = useBorrowTokensList()

  const collateralToSet = useMemo(() => {
    const [firstCollateral] = collateralsList

    return firstCollateral?.amountInWallet
      ? firstCollateral
      : collateralsList.find(({ collateral }) => collateral.mint === BANX_TOKEN_MINT.toBase58())
  }, [collateralsList])

  useEffect(() => {
    if (!collateralToken && collateralToSet) {
      setCollateralToken(collateralToSet)
    }
  }, [collateralToken, collateralToSet])

  useEffect(() => {
    const selectedBorrowToken = borrowTokensList.find(
      (token) => token.lendingTokenType === tokenType,
    )

    if (!selectedBorrowToken) return

    // Update collateral token only if it's the same token
    if (collateralToken?.collateral.mint === selectedBorrowToken.collateral.mint) {
      setCollateralToken(collateralToSet)
    }

    setBorrowToken(selectedBorrowToken)
  }, [borrowTokensList, tokenType, collateralToken, collateralToSet])

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setTokenType(token.lendingTokenType)
  }

  const { ltvPercent, upfrontFee, weeklyFee } = getSummaryInfo({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    apr: parseFloat(inputAprValue),
    collateralToken,
    tokenType,
  })

  const { errorMessage, hasAprErrorMessage } = getInputErrorMessage({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    freezeDuration: parseFloat(inputFreezeValue),
    apr: parseFloat(inputAprValue),
    collateralToken,
    liquidationLtv: parseFloat(liquidationLtv),
    ltvPercent,
  })

  const listLoan = useListLoan({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    freezeDuration: parseFloat(inputFreezeValue),
    apr: parseFloat(inputAprValue),
    collateralToken,
    liquidationLtvBP: parseFloat(liquidationLtv) * 100,
    offerLtvBP: Math.round(ltvPercent * 100),
  })

  const marketUpfrontFee = collateralToken?.collateral.interestFee || 0
  const lenderAprValue = !hasAprErrorMessage
    ? calcLenderTokenApr(parseFloat(inputAprValue), marketUpfrontFee)
    : null

  return {
    listLoan,

    collateralsList,
    borrowTokensList,

    borrowToken,
    setBorrowToken: handleBorrowTokenChange,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    inputAprValue,
    setInputAprValue,

    inputFreezeValue,
    setInputFreezeValue,

    liquidationLtv,
    setLiquidationLtv,

    lenderAprValue,

    errorMessage,

    ltvPercent,
    upfrontFee,
    weeklyFee,
  }
}
