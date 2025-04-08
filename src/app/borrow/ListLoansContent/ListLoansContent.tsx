import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import Faq from '@banx/components/Faq'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'
import { NumericStepInput } from '@banx/components/inputs'

import { CollateralToken } from '@banx/api'
import { ZERO_BN, bnToHuman } from '@banx/utils/bn'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'

import InputTokenSelect, { ControlsButtons } from '../components/InputTokenSelect'
import { useListLoansContent } from './hooks'

import styles from './ListLoansContent.module.scss'

const ListLoansContent = () => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletSidebar()

  const {
    listLoan,
    collateralsList,
    borrowTokensList,
    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,
    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,
    inputAprValue,
    setInputAprValue,
    liquidationLtv,
    setLiquidationLtv,
    inputFreezeValue,
    setInputFreezeValue,
    lenderAprValue,
    errorMessage,
    ltvPercent,
    upfrontFee,
    weeklyFee,
  } = useListLoansContent()

  const onActionClick = () => {
    if (connected) {
      return listLoan()
    }

    toggleVisibility()
  }

  const isOracleMarket = collateralToken?.collateral.oraclePriceFeedType !== 'none'
  const displayMessage = !connected ? 'Connect wallet' : errorMessage || 'List request'

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <InputTokenSelect
          label="Your collateral"
          value={collateralInputValue}
          onChange={setCollateralInputValue}
          selectedToken={collateralToken}
          onChangeToken={setCollateralToken}
          tokensList={collateralsList}
          className={styles.collateralInput}
          rightContentJSX={
            <ControlsButtons
              onChange={setCollateralInputValue}
              maxValue={bnToHuman(
                collateralToken?.amountInWallet || ZERO_BN,
                collateralToken?.collateral.decimals,
              )}
            />
          }
        />

        <InputTokenSelect
          label="To borrow"
          value={borrowInputValue}
          onChange={setBorrowlInputValue}
          selectedToken={borrowToken}
          onChangeToken={setBorrowToken}
          tokensList={borrowTokensList}
          className={styles.borrowInput}
        />

        <div className={styles.fields}>
          {isOracleMarket && (
            <NumericStepInput
              label="Liq. LTV"
              value={liquidationLtv}
              onChange={setLiquidationLtv}
              disabled={!connected}
              placeholder="0"
              postfix="%"
              step={1}
            />
          )}

          <div className={styles.aprFieldWrapper}>
            <NumericStepInput
              label="Apr"
              value={inputAprValue}
              onChange={setInputAprValue}
              disabled={!connected}
              integerOnly
              placeholder="0"
              postfix="%"
              step={1}
            />

            <LenderAprMessage apr={lenderAprValue} />
          </div>

          <NumericStepInput
            label="Freeze"
            value={inputFreezeValue}
            onChange={setInputFreezeValue}
            disabled={!connected}
            placeholder="0"
            postfix="d"
            tooltipText="Period during which loan can't be terminated"
            step={1}
          />
        </div>

        <Summary
          ltv={ltvPercent}
          upfrontFee={upfrontFee}
          weeklyFee={weeklyFee}
          collateral={collateralToken}
        />

        <Button
          onClick={onActionClick}
          className={styles.actionButton}
          disabled={connected && !!errorMessage}
        >
          {displayMessage}
        </Button>
      </div>
      <Faq type="listing" className={styles.faqContainer} />
    </div>
  )
}

export default ListLoansContent

interface SummaryProps {
  ltv: number
  weeklyFee: number
  upfrontFee: number
  collateral: CollateralToken | undefined
}

const Summary: FC<SummaryProps> = ({ ltv, upfrontFee, weeklyFee, collateral }) => {
  const statClassNames = {
    value: styles.fixedStatValue,
  }

  const formattedLtv = ltv.toFixed(0)

  const marketUpfrontFeePercent = collateral ? collateral.collateral.upfrontFee / 100 : 0

  return (
    <div className={styles.summary}>
      <StatInfo
        label="LTV"
        value={formattedLtv}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: ltv ? getColorByPercent(ltv, HealthColorIncreasing) : '' }}
        flexType="row"
      />
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        classNamesProps={statClassNames}
        tooltipText={`${marketUpfrontFeePercent}% upfront fee charged on the loan principal amount, paid when loan is funded`}
        flexType="row"
      />
      <StatInfo
        label="Weekly fee"
        value={<DisplayValue value={weeklyFee} />}
        classNamesProps={statClassNames}
        tooltipText="Weekly interest on your loan. Interest is added to your debt balance"
        flexType="row"
      />
    </div>
  )
}

const LenderAprMessage: FC<{ apr: number | null }> = ({ apr }) => {
  const showAprMessage = apr !== null && !isNaN(apr)

  return (
    <div className={styles.lenderAprMessageWrapper}>
      {showAprMessage && (
        <span className={styles.lenderAprMessage}>Lender sees: {createPercentValueJSX(apr)}</span>
      )}
    </div>
  )
}
