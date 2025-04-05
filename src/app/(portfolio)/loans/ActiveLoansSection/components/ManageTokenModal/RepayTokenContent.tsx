import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'

import { TokenLoan, core } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  formatTrailingZeros,
  getColorByPercent,
  getTokenDecimals,
  getTokenUnit,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { useLoansTxns } from '../../hooks'

import styles from './ManageTokenModal.module.scss'

interface RepayTokenContentProps {
  loan: TokenLoan
}

export const RepayTokenContent: FC<RepayTokenContentProps> = ({ loan }) => {
  const { repayLoan, repayPartialLoan } = useLoansTxns()

  const lendingToken = loan.bondTradeTransaction.lendingToken
  const marketTokenDecimals = getTokenDecimals(lendingToken)

  const {
    repaymentCallActive,
    repaymentCallAmount,
    initialRepayPercent,
    debtWithoutFee,
    debtValue,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  } = calculateRepaymentStaticValues(loan)

  const initialPaybackValue = formatWithMarketDecimals(debtValue, marketTokenDecimals)

  const [repaymentPercent, setRepaymentPercent] = useState<number>(initialRepayPercent)
  const [paybackValueInput, setPaybackValueInput] = useState<string>(initialPaybackValue)

  const isRoundedRepayment = repaymentPercent === roundedRepaymentPercentage

  //? Calculate base debt depending on whether it's full or partial repayment
  const calculateBaseDebt = (percent: number) =>
    isFullRepayment(percent) ? debtValue : debtWithoutFee

  const calculatePaybackValue = (baseDebt: number, percent: number) => (baseDebt * percent) / 100

  const baseDebtValue = calculateBaseDebt(repaymentPercent)
  const selectedRepaymentPercentage = isRoundedRepayment
    ? unroundedRepaymentPercentage
    : repaymentPercent

  const paybackValue = calculatePaybackValue(baseDebtValue, selectedRepaymentPercentage)
  const remainingDebt = debtValue - paybackValue

  const handleSliderChange = (percent: number) => {
    setRepaymentPercent(percent)

    const baseDebtValue = calculateBaseDebt(percent)
    const newPaybackValue = calculatePaybackValue(baseDebtValue, percent)
    setPaybackValueInput(formatWithMarketDecimals(newPaybackValue, marketTokenDecimals))
  }

  const handleInputChange = (value: string) => {
    setPaybackValueInput(value)

    const parsedValue = parseFloat(value)

    if (isNaN(parseFloat(value))) {
      setRepaymentPercent(0)
    }

    const newRepaymentPercent = ((parsedValue * 10 ** marketTokenDecimals) / baseDebtValue) * 100
    setRepaymentPercent(Math.min(newRepaymentPercent, 100))
  }

  const onSubmit = async () => {
    if (isFullRepayment(repaymentPercent)) {
      return await repayLoan(loan)
    }

    //? If repaymentPercent equals roundedRepaymentPercentage, repay a partial loan with rounded up percentage
    const fractionToRepay = isRoundedRepayment
      ? Math.ceil(unroundedRepaymentPercentage * 100)
      : repaymentPercent * 100

    return await repayPartialLoan(loan, fractionToRepay)
  }

  const colorClassNameByValue = {
    [Math.ceil(initialRepayPercent)]: styles.repayModalSliderYellow,
    100: styles.repayModalSliderGreen,
  }

  return (
    <>
      <NumericStepInput
        label="Repay value"
        value={paybackValueInput}
        onChange={handleInputChange}
        postfix={getTokenUnit(lendingToken)}
      />

      <Slider
        value={repaymentPercent}
        onChange={handleSliderChange}
        className={styles.repayModalSlider}
        rootClassName={getColorByPercent(repaymentPercent, colorClassNameByValue)}
      />

      <div className={styles.repayModalAdditionalInfo}>
        {repaymentCallActive && (
          <StatInfo
            flexType="row"
            label="Repayment call"
            value={<DisplayValue value={repaymentCallAmount} strictTokenType={lendingToken} />}
            classNamesProps={{ label: styles.repayModalRepaymentCall }}
            onClickProps={{
              onLabelClick: () => handleSliderChange(initialRepayPercent),
            }}
          />
        )}
        <StatInfo
          label="Total debt"
          value={<DisplayValue value={debtValue} strictTokenType={lendingToken} />}
          flexType="row"
        />
        <StatInfo
          label="Debt after repayment"
          value={<DisplayValue value={remainingDebt} strictTokenType={lendingToken} />}
          flexType="row"
        />
      </div>
      <Button className={styles.repayModalButton} onClick={onSubmit} disabled={!repaymentPercent}>
        Repay <DisplayValue value={paybackValue} strictTokenType={lendingToken} />
      </Button>
    </>
  )
}

const DEFAULT_REPAY_PERCENT = 100

const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const { bondTradeTransaction } = loan

  const repaymentCallActive = isTokenLoanRepaymentCallActive(loan)
  const repaymentCallAmount = bondTradeTransaction.repaymentCallAmount

  //? For partial repayment loans, feeAmount is not included in the debt calculation
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100

  //? Round up the repayment percentage to the nearest whole number to ensure all debt is covered when repaying (Uses for repayment call feature)
  const roundedRepaymentPercentage = Math.ceil(unroundedRepaymentPercentage)

  const initialRepayPercent = repaymentCallActive
    ? roundedRepaymentPercentage
    : DEFAULT_REPAY_PERCENT

  return {
    repaymentCallActive,
    debtValue,
    initialRepayPercent,
    debtWithoutFee,
    repaymentCallAmount,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  }
}

const formatWithMarketDecimals = (value: number, marketDecimals: number, decimalsPlaces = 4) =>
  formatTrailingZeros((value / 10 ** marketDecimals).toFixed(decimalsPlaces))

const isFullRepayment = (percent: number) => percent === 100
