import React, { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'

import { TokenLoan, core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { calcWeightedAverage, calculateTokenLoanLtvByLoanValue } from '@banx/utils'

import { calcTokenWeeklyInterest, calculateLendToBorrowValue } from '../helpers'
import { useMarketLoansState } from '../hooks/useMarketLoansState'
import { LenderRefinanceModal } from './LenderRefinanceModal'

import styles from '../ClientMarketLoansPage.module.scss'

export const MarketLoansSummary: FC<{ loans: TokenLoan[] }> = ({ loans: rawLoans }) => {
  const { publicKey, connected } = useWallet()
  const { open: openModal } = useModal()
  const { toggleVisibility } = useWalletSidebar()
  const { selection, set: setSelection } = useMarketLoansState()

  const loans = useMemo(() => {
    if (!publicKey) return []
    return rawLoans.filter((loan) => loan.bondTradeTransaction.user !== publicKey.toBase58())
  }, [publicKey, rawLoans])

  const { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv } =
    calculateSummaryInfo(selection)

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    return openModal(LenderRefinanceModal, { loans: selection })
  }

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value))
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Weighted ltv" value={weightedLtv} valueType={VALUES_TYPES.PERCENT} />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyInterest} />} />
        <StatInfo
          label="Weighted apr"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.weightedAprStat }}
        />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={selection.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
          rootClassName={styles.slider}
        />
        <Button className={styles.lendButton} onClick={onClickHandler} disabled={!selection.length}>
          Lend <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}

const calculateSummaryInfo = (loans: core.TokenLoan[]) => {
  const totalDebt = sumBy(loans, (loan) => calculateLendToBorrowValue(loan))

  const totalLoanValue = map(loans, (loan) => calculateLendToBorrowValue(loan))
  const totalWeeklyInterest = sumBy(loans, (loan) => calcTokenWeeklyInterest(loan))

  const totalAprArray = map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLtvArray = map(loans, (loan) =>
    calculateTokenLoanLtvByLoanValue(loan, calculateLendToBorrowValue(loan)),
  )

  const weightedApr = calcWeightedAverage(totalAprArray, totalLoanValue)
  const weightedLtv = calcWeightedAverage(totalLtvArray, totalLoanValue)

  return { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv }
}
