import { FC, useState } from 'react'

import { useConnection } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api'
import { useLoansTxns } from '@banx/app/(portfolio)/loans/ActiveLoansSection/hooks'
import { useCollateralConversionRate } from '@banx/app/multiply/[ticker]/hooks'
import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { Settings } from '@banx/icons'
import { useModal, useSlippage } from '@banx/store/common'
import { formatCompact } from '@banx/utils/common'
import { caclulateBorrowTokenLoanValue } from '@banx/utils/core'
import { toFixedNoNegativeZero } from '@banx/utils/numbers'
import { getTokenDecimals } from '@banx/utils/tokens'

import { SLIPPAGE_TABS } from '../AppSettingsModal'
import { calculateInitialCollateralRate, calculateUserCollateralAmount } from './helpers'

import styles from './SellToRepayModal.module.scss'

type SellToRepayModalProps = {
  loan: Loan
  pair: MultiplyPair
}

const PRICE_IMPACT_WARNING_THRESHOLD_PERCENT = -5

export const SellToRepayModal: FC<SellToRepayModalProps> = ({ loan, pair }) => {
  const { close: closeModal } = useModal()
  const { slippage, slippageBps } = useSlippage()
  const { connection } = useConnection()
  const { sellToRepay } = useLoansTxns()

  const [slippageTabsVisible, setSlippageTabsVisible] = useState(false)

  const initialCollateralRate = calculateInitialCollateralRate(loan)

  const totalRepayValue = caclulateBorrowTokenLoanValue(loan).toNumber()

  const { rate: realCollateralRate, isLoading: realCollateralRateLoading } =
    useCollateralConversionRate({
      amount: totalRepayValue,
      pair,
      collateralDecimals: loan.collateral.decimals,
      mode: 'sellToRepay',
      slippageBps,
      connection,
    })
  const { rate: expectedCollateralRate, isLoading: expectedCollateralRateLoading } =
    useCollateralConversionRate({
      pair,
      collateralDecimals: loan.collateral.decimals,
      mode: 'sellToRepay',
      slippageBps,
      connection,
    })
  const priceImpact = ((realCollateralRate - expectedCollateralRate) / expectedCollateralRate) * 100

  const isLoading = expectedCollateralRateLoading || realCollateralRateLoading

  const onSellToRepay = async () => {
    //? close modal only after success
    await sellToRepay({
      loan,
      pair,
      expectedCollateralConversionRate: expectedCollateralRate, //? used for lrtsSOL only
      onSuccess: closeModal,
    })
  }

  // Calculations
  const collateralDecimals = loan.collateral.decimals
  const tokenDecimals = getTokenDecimals(pair.marketTokenType)
  const decimalsDiff = collateralDecimals - tokenDecimals

  const repayValueInCollateral = totalRepayValue * realCollateralRate * 10 ** decimalsDiff //? Need to multiply by 10 ** decimalsDiff because we operate numbers with decimals

  const totalLoanCollateralAmount = loan.fraktBond.fbondTokenSupply
  const initialUserCollateralAmount = calculateUserCollateralAmount(loan)

  const userCollateralAmountInitialPrice =
    initialUserCollateralAmount / initialCollateralRate / 10 ** decimalsDiff //? Price in token (SOL/USDC) with decimals

  const currentUserCollateralAmount = totalLoanCollateralAmount - repayValueInCollateral
  const currentUserCollateralPrice =
    currentUserCollateralAmount / realCollateralRate / 10 ** decimalsDiff //? Price in token (SOL/USDC) with decimals

  const pnl = currentUserCollateralPrice - userCollateralAmountInitialPrice //? value in token (SOL/USDC) with decimals
  // Calculations

  // Formatting
  const formattedInitialUserCollateralAmount = formatCompact(
    (initialUserCollateralAmount / 10 ** collateralDecimals).toString(),
    3,
  )
  const formattedCurrentUserCollateralAmount = formatCompact(
    (currentUserCollateralAmount / 10 ** collateralDecimals).toString(),
    3,
  )
  // Formatting

  const isNegativePnl = pnl < 0

  const statClassNames = {
    value: styles.fixedStatValue,
  }

  const lendingToken = loan.bondTradeTransaction.lendingToken

  return (
    <Modal open centered onCancel={closeModal} maskClosable={false} width={496}>
      <div
        className={classNames(styles.modalContent, {
          [styles.modalContentSlippageVisible]: slippageTabsVisible,
        })}
      >
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>Pay attention!</h2>
          <Button
            variant="tertiary"
            onClick={() => setSlippageTabsVisible((prev) => !prev)}
            className={classNames(styles.slippageBtn, {
              [styles.slippageBtnActive]: slippageTabsVisible,
            })}
          >
            <Settings />
            Max slippage: {slippage}%
          </Button>
          <h5 className={styles.subtitle}>Slippage may affect how much funds you&apos;ll get</h5>
          {slippageTabsVisible && <SlippageTabs />}
        </div>

        {isLoading && <Loader />}

        {!isLoading && (
          <>
            <div className={styles.summary}>
              <StatInfo
                label="Debt"
                value={<DisplayValue strictTokenType={lendingToken} value={totalRepayValue} />}
                classNamesProps={statClassNames}
                flexType="row"
              />
              <StatInfo
                label="Initial collateral"
                value={
                  <span>
                    {formattedInitialUserCollateralAmount} {pair.collateralTicker} (
                    <DisplayValue
                      strictTokenType={lendingToken}
                      value={userCollateralAmountInitialPrice}
                    />
                    )
                  </span>
                }
                classNamesProps={statClassNames}
                flexType="row"
              />
              <StatInfo
                label="Current collateral"
                value={
                  <span>
                    {formattedCurrentUserCollateralAmount} {pair.collateralTicker} (
                    <DisplayValue
                      strictTokenType={lendingToken}
                      value={currentUserCollateralPrice}
                    />
                    )
                  </span>
                }
                classNamesProps={statClassNames}
                flexType="row"
              />
              <StatInfo
                label="PNL"
                value={
                  <span>
                    {isNegativePnl ? '' : '+'}
                    <DisplayValue strictTokenType={lendingToken} value={pnl} />
                  </span>
                }
                classNamesProps={{
                  value: classNames(statClassNames.value, {
                    [styles.textGreen]: !isNegativePnl,
                    [styles.textRed]: isNegativePnl,
                  }),
                }}
                flexType="row"
              />
              <StatInfo
                label="Price impact"
                value={`${toFixedNoNegativeZero(priceImpact, 2)}%`}
                classNamesProps={{
                  value: classNames(statClassNames.value, {
                    [styles.textRed]: priceImpact < PRICE_IMPACT_WARNING_THRESHOLD_PERCENT,
                  }),
                }}
                flexType="row"
              />
            </div>
            <Button className={styles.confirmButton} onClick={onSellToRepay}>
              Confirm
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

const SlippageTabs = () => {
  const { slippage, setSlippage } = useSlippage()

  const {
    tabs: slippageTabs,
    value: slippageTabValue,
    setValue: setSlippageTabValue,
  } = useTabs({
    tabs: SLIPPAGE_TABS,
    defaultValue:
      SLIPPAGE_TABS.find(({ value }) => parseFloat(value) === slippage)?.value ??
      SLIPPAGE_TABS[0].value,
  })

  return (
    <div className={styles.tabs}>
      {slippageTabs.map(({ label, value: tabValue, disabled }) => {
        const isActive = tabValue === slippageTabValue

        return (
          <button
            key={tabValue}
            className={classNames(styles.tab, { [styles.tabActive]: isActive })}
            name={tabValue}
            onClick={() => {
              setSlippageTabValue(tabValue)
              setSlippage(parseFloat(tabValue))
            }}
            disabled={disabled}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
