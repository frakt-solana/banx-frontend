import { useCallback, useEffect, useMemo, useState } from 'react'

import { MAX_APR_SPL, MIN_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { every, isEqual, pick } from 'lodash'

import { TokenMarketPreview } from '@banx/api'
import { SyntheticTokenOffer } from '@banx/store'
import { formatTokensPerCollateral, formatValueByTokenType, getTokenDecimals } from '@banx/utils'

const DEFAULT_APR_PERCENT = 30

const formState = {
  apr: '',
  offerSize: '',
  tokensPerCollateral: '',
  offerLtv: '',
  offerLiquidationLtv: '',
}

export type FormState = typeof formState
export type FormFields = keyof typeof formState
export type FieldErrors = Partial<Record<FormFields, string | null>>

export const FIELD_CONFIG: Record<string, FormFields[]> = {
  oracle: ['apr', 'offerSize', 'offerLtv', 'offerLiquidationLtv'],
  nonOracle: ['apr', 'offerSize', 'tokensPerCollateral'],
}

export const useOfferFormController = (props: {
  syntheticOffer: SyntheticTokenOffer
  market: TokenMarketPreview | undefined
  lendingToken: LendingTokenType
}) => {
  const { syntheticOffer, market, lendingToken } = props

  const initialValues = useMemo(
    () => computeInitialValues(syntheticOffer, market, lendingToken),
    [syntheticOffer, market, lendingToken],
  )

  const [formState, setFormState] = useState(initialValues)

  const handleInputChange = useCallback((field: FormFields, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    setFormState(initialValues)
  }, [initialValues])

  const resetForm = useCallback(() => {
    setFormState(initialValues)
  }, [initialValues])

  const hasFormChanges = useMemo(
    () => !isEqual(formState, initialValues),
    [formState, initialValues],
  )

  const numericValues = useMemo(
    () => ({
      apr: parseFloat(formState.apr),
      offerSize: parseFloat(formState.offerSize),
      tokensPerCollateral: parseFloat(formState.tokensPerCollateral),
      offerLiquidationLtv: parseFloat(formState.offerLiquidationLtv),
      offerLtv: parseFloat(formState.offerLtv),
    }),
    [formState],
  )

  const generateField = (field: FormFields) => ({
    value: formState[field],
    onChange: (value: string) => handleInputChange(field, value),
  })

  return {
    formState,
    initialValues,
    numericValues,
    handleInputChange,
    hasFormChanges,
    resetForm,
    generateField,
  }
}

const computeInitialValues = (
  syntheticOffer: SyntheticTokenOffer,
  market: TokenMarketPreview | undefined,
  lendingToken: LendingTokenType,
) => {
  const lendingTokenDecimals = getTokenDecimals(lendingToken)
  const collateralDecimals = market?.collateral.decimals || 0

  const rawApr = syntheticOffer.apr ?? DEFAULT_APR_PERCENT
  const rawTokensPerCollateral = calculateTokensPerCollateralFloat(
    syntheticOffer.collateralsPerToken,
    collateralDecimals,
    lendingTokenDecimals,
  )

  const formattedApr = rawApr.toString()
  const formattedOfferSize = formatValueByTokenType(syntheticOffer.offerSize, lendingToken)

  const formattedOfferLtv = syntheticOffer.offerLtv.toString()
  const formattedOfferLiquidationLtv = syntheticOffer.liquidationLtv.toString()

  const formattedTokensPerCollateral = formatTokensPerCollateral(
    rawTokensPerCollateral,
    lendingTokenDecimals,
  ).toString()

  return {
    apr: formattedApr || '0',
    offerSize: formattedOfferSize || '0',
    offerLtv: formattedOfferLtv || '0',
    offerLiquidationLtv: formattedOfferLiquidationLtv || '0',
    tokensPerCollateral: formattedTokensPerCollateral || '0',
  }
}

export const useFormStateChecks = ({
  formState,
  initialValues,
  fieldConfig,
}: {
  formState: FormState
  initialValues: FormState
  fieldConfig: FormFields[]
}) => {
  const filteredFormState = pick(formState, fieldConfig)

  const areFieldsFilled = useMemo(() => {
    return every(filteredFormState, (value) => Boolean(value) && value !== '0')
  }, [filteredFormState])

  const hasChanges = useMemo(() => !isEqual(formState, initialValues), [formState, initialValues])

  const errorMessage = useMemo(() => {
    const ltvError = getLtvErrorMessage(
      parseFloat(formState.offerLtv),
      parseFloat(formState.offerLiquidationLtv),
    )
    const aprError = getAprErrorMessage(parseFloat(formState.apr))
    return ltvError || aprError
  }, [formState])

  const disablePlaceOffer = !areFieldsFilled || Boolean(errorMessage)
  const disableUpdateOffer = !hasChanges || !areFieldsFilled || Boolean(errorMessage)

  return {
    areFieldsFilled,
    disablePlaceOffer,
    disableUpdateOffer,
    errorMessage,
  }
}

const getAprErrorMessage = (apr: number) => {
  if (!apr) return null

  const aprRate = apr * 100

  if (aprRate > MAX_APR_SPL) {
    return `Max APR is ${MAX_APR_SPL / 100}%`
  }

  if (aprRate < MIN_APR_SPL) {
    return `Min APR is ${MIN_APR_SPL / 100}%`
  }

  return null
}

const getLtvErrorMessage = (offerLtv: number, liquidationLtv: number) => {
  if (!offerLtv || !liquidationLtv) return null

  if (offerLtv > 100 || liquidationLtv > 100) {
    return 'LTV must not exceed 100%'
  }

  if (offerLtv >= liquidationLtv) {
    return 'Liquidation LTV must be higher than offer LTV'
  }

  return null
}
