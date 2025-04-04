'use client'

import { FC, useState } from 'react'

import { capitalize } from 'lodash'
import { useParams } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Button } from '@banx/components/Buttons'
import { MARKET_OPTIONS_WITHOUT_ALL, TokenDropdown } from '@banx/components/Dropdowns'
import Faq from '@banx/components/Faq'
import { Loader } from '@banx/components/Loader'
import { DisplayValue } from '@banx/components/TableComponents'
import TokenInput from '@banx/components/TokenInput'

import { CollateralToken } from '@banx/api/tokens'
import { PATHS } from '@banx/constants'
import { Settings } from '@banx/icons'
import { useTokenType } from '@banx/store'

import { MultiplierSlider } from './components/MultiplierSlider'
import { OrderBook } from './components/OrderBook'
import { Summary } from './components/Summary'
import { useLeverage, useSelectedCollateralInfo } from './hooks'
import { MultiplyPair } from './types'

import styles from './ClientMultiplyPage.module.scss'

export const ClientMultiplyPage = () => {
  const { ticker: urlTicker = '' } = useParams<{ ticker: string }>()
  const customPairInUse = urlTicker !== 'any'

  const { collateralToken, collateralTokensList, pair, onCollateralChange, isLoading } =
    useSelectedCollateralInfo(customPairInUse ? urlTicker : undefined)

  const onboardContentType = customPairInUse ? pair?.onboardingContent : 'multiply'
  const breadcrumbTitle = customPairInUse ? urlTicker : capitalize(urlTicker)

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Multiply', path: PATHS.LEVERAGE_BASE }, { title: breadcrumbTitle }]}
        onboardContentType={onboardContentType}
        faqType="multiply"
      />
      {isLoading && <Loader />}
      {pair && collateralToken && (
        <LeverageContent
          collateralTokensList={collateralTokensList}
          onCollateralChange={onCollateralChange}
          customPairInUse={customPairInUse}
          collateralToken={collateralToken}
          pair={pair}
        />
      )}
    </div>
  )
}

type LeverageContentProps = {
  pair: MultiplyPair
  collateralToken: CollateralToken
  customPairInUse: boolean
  collateralTokensList?: CollateralToken[]
  onCollateralChange?: (token: CollateralToken) => void
}
const LeverageContent: FC<LeverageContentProps> = ({
  pair,
  collateralToken,
  customPairInUse,
  collateralTokensList,
  onCollateralChange,
}) => {
  const {
    slippage,
    openAppSettingsModal,

    collateralAmount,
    setCollateralAmount,
    totalCollateralAmount,
    collateralPriceHuman,
    collateralConversionRate,

    multiplierValue,
    setMultiplierValue,
    userEnteredCollateralAmount,

    simpleOffers,
    offersLoading,
    selectedOffer,
    setSelectedOffer,

    borrowBtnProps,
    onLeverageBorrow,
    borrowBtnLoading,
  } = useLeverage({ pair, collateralToken })

  const { tokenType, setTokenType } = useTokenType()
  const [showOrderBook, setShowOrderBook] = useState(false)

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.controlBtns}>
            <Button variant="tertiary" onClick={() => setShowOrderBook((prev) => !prev)}>
              {showOrderBook ? 'Hide offers' : 'Show offers'}
            </Button>

            <Button
              variant="tertiary"
              onClick={openAppSettingsModal}
              className={styles.slippageBtn}
            >
              <Settings />
              Max slippage: {slippage}%
            </Button>
          </div>
          {/* {Hide LendingTokenType selector for custom pairs} */}
          {!customPairInUse && (
            <div className={styles.tokenDropdownWrapper}>
              <TokenDropdown
                className={styles.tokenDropdown}
                option={tokenType}
                options={MARKET_OPTIONS_WITHOUT_ALL}
                onChange={(value) => setTokenType(value)}
                size="small"
              />
            </div>
          )}
          <TokenInput
            label="Your collateral"
            value={collateralAmount}
            onChange={setCollateralAmount}
            selectedToken={collateralToken || undefined}
            onChangeToken={onCollateralChange}
            className={styles.borrowInput}
            //? Prevent token selection for custom pairs
            tokensList={customPairInUse ? undefined : collateralTokensList}
          />
          {!!collateralPriceHuman && (
            <p className={styles.collateralPrice}>
              1 {pair.collateralTicker} =
              <DisplayValue
                value={collateralPriceHuman}
                strictTokenType={pair.marketTokenType}
                isSubscriptFormat
              />
            </p>
          )}
          <MultiplierSlider
            selectedOffer={selectedOffer}
            multiplierValue={multiplierValue}
            setMultiplierValue={setMultiplierValue}
            userEnteredCollateralAmount={userEnteredCollateralAmount}
            offers={simpleOffers}
            setSelectedOffer={setSelectedOffer}
          />
          <div className={styles.footerContent}>
            {!!selectedOffer && (
              <Summary
                selectedOffer={selectedOffer}
                conversionRate={collateralConversionRate}
                collateralPriceHuman={collateralPriceHuman}
                totalCollateralAmount={totalCollateralAmount}
                userEnteredCollateralAmount={userEnteredCollateralAmount}
                pair={pair}
                collateral={collateralToken}
              />
            )}

            <Button
              onClick={onLeverageBorrow}
              className={styles.depositButton}
              disabled={borrowBtnProps.disabled}
              loading={borrowBtnLoading}
            >
              {borrowBtnProps.text}
            </Button>
          </div>
        </div>
        {showOrderBook && (
          <OrderBook
            simpleOffers={simpleOffers}
            selectedOffer={selectedOffer}
            collateral={collateralToken}
            loading={offersLoading}
          />
        )}
      </div>
      <Faq type="multiply" className={styles.faqContainer} />
    </>
  )
}
