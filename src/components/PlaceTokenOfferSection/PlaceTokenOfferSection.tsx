import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty } from 'lodash'

import { MarketTokenRewards } from '@banx/api'
import { getTokenUnit, isBanxSolTokenType } from '@banx/utils/tokens'

import { InputErrorMessage, NumericStepInput } from '../inputs'
import { ActionsButtons } from './components/ActionsButtons'
import { LtvPercentageSelector, LtvValueSelector } from './components/LtvSelectors'
import { AdditionalSummary, ExtraRewards } from './components/Summary'
import { usePlaceTokenOffer } from './hooks/usePlaceTokenOffer'

import styles from './PlaceTokenOfferSection.module.scss'

interface PlaceTokenOfferSectionProps {
  marketPubkey: string
  offerPubkey?: string
  lendingToken: LendingTokenType
  marketRewards?: MarketTokenRewards
}

const PlaceTokenOfferSection: FC<PlaceTokenOfferSectionProps> = (props) => {
  const { marketPubkey, offerPubkey = '', lendingToken, marketRewards } = props

  const { connected } = useWallet()
  const { market, isEditMode, isOracleMarket, values, fields, actions, validation } =
    usePlaceTokenOffer({
      marketPubkey,
      offerPubkey,
      lendingToken,
    })

  const inputStepByTokenType = isBanxSolTokenType(lendingToken) ? 0.1 : 1
  const lendingTokenUnit = getTokenUnit(lendingToken)

  return (
    <>
      <div className={styles.fieldsColumn}>
        {!isOracleMarket && (
          <NumericStepInput
            label="Price"
            {...fields.tokensPerCollateral}
            postfix={lendingTokenUnit}
            disabled={!connected}
            step={inputStepByTokenType}
            rightLabelJSX={
              <LtvValueSelector
                market={market}
                onChange={fields.tokensPerCollateral.onChange}
                lendingToken={lendingToken}
              />
            }
          />
        )}

        {isOracleMarket && (
          <NumericStepInput
            label="Offer ltv"
            {...fields.offerLtv}
            postfix="%"
            disabled={!connected}
            step={1}
            rightLabelJSX={
              <LtvPercentageSelector market={market} onChange={fields.offerLtv.onChange} />
            }
          />
        )}

        <div className={styles.fieldsRow}>
          {isOracleMarket && (
            <NumericStepInput
              label="Liquidation LTV"
              {...fields.offerLiquidationLtv}
              postfix="%"
              disabled={!connected}
              step={1}
            />
          )}

          <NumericStepInput
            label="Apr"
            {...fields.apr}
            disabled={!connected}
            postfix="%"
            step={1}
          />

          <NumericStepInput
            label="Size"
            {...fields.offerSize}
            disabled={!connected}
            postfix={lendingTokenUnit}
            step={inputStepByTokenType}
          />
        </div>
      </div>

      <InputErrorMessage
        message={validation.errorMessage || ''}
        className={styles.inputErrorMessage}
      />

      <AdditionalSummary
        market={market}
        lendingToken={lendingToken}
        apr={values.apr}
        offerSize={values.offerSize}
        tokensPerCollateral={values.tokensPerCollateral}
      />

      {!isEmpty(marketRewards) && <ExtraRewards data={marketRewards} />}

      <ActionsButtons
        isEditMode={isEditMode}
        lendingToken={lendingToken}
        offerSize={values.offerSize}
        createOffer={actions.createOffer}
        removeOffer={actions.removeOffer}
        updateOffer={actions.updateOffer}
        disablePlaceOffer={validation.disablePlaceOffer}
        disableUpdateOffer={validation.disableUpdateOffer}
      />
    </>
  )
}

export default PlaceTokenOfferSection
