import { FC, useMemo, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import TokenInput from '@banx/components/TokenInput'

import { TokenLoan } from '@banx/api'
import { useCollateralsList } from '@banx/hooks'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanLtvByLoanValue,
  stringToBN,
} from '@banx/utils'

import { useLoansTxns } from '../../hooks'

import styles from './ManageTokenModal.module.scss'

interface SupplyCollateralContentProps {
  loan: TokenLoan
}

const SupplyCollateralContent: FC<SupplyCollateralContentProps> = ({ loan }) => {
  const { supplyCollateral } = useLoansTxns()
  const { collateralsList } = useCollateralsList()

  const collateralToken = useMemo(
    () => collateralsList.find(({ collateral }) => collateral.mint === loan.collateral.mint),
    [collateralsList, loan.collateral.mint],
  )

  const [collateralAmount, setCollateralAmount] = useState<string>('0')

  const handleSupplyCollateral = () => {
    if (!collateralToken) return

    const collateralAmountBN = stringToBN(collateralAmount, collateralToken.collateral.decimals)
    supplyCollateral(loan, collateralAmountBN)
  }

  const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentLtv = calculateTokenLoanLtvByLoanValue(loan, debtValue)
  const liquidationLtv = loan.liquidationLtvBp / 100

  const newLtv = calculateNewLtv(loan, collateralAmount)

  return (
    <div>
      <TokenInput
        label="Your collateral"
        value={collateralAmount}
        onChange={setCollateralAmount}
        selectedToken={collateralToken}
      />

      <div className={styles.supplyCollateralStats}>
        <StatInfo
          label="ltv"
          value={
            <>
              <span className={styles.currentLtv}>{currentLtv.toFixed(2)}%</span>
              <span> → </span>
              <span>{newLtv.toFixed(2)}%</span>
            </>
          }
          flexType="row"
        />
        <StatInfo
          label="Liquidation ltv"
          value={liquidationLtv}
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      </div>

      <Button
        className={styles.supplyCollateralButton}
        onClick={handleSupplyCollateral}
        disabled={!parseFloat(collateralAmount)}
      >
        Supply
      </Button>
    </div>
  )
}

export default SupplyCollateralContent

const calculateNewLtv = (loan: TokenLoan, collateralAmount: string): number => {
  const { fraktBond, collateral } = loan
  const collateralAmountNum = parseFloat(collateralAmount) || 0

  const updatedFbondTokenSupply =
    fraktBond.fbondTokenSupply + collateralAmountNum * 10 ** collateral.decimals

  const newLoan = {
    ...loan,
    fraktBond: {
      ...fraktBond,
      fbondTokenSupply: updatedFbondTokenSupply,
    },
  }

  const debtValue = caclulateBorrowTokenLoanValue(newLoan).toNumber()
  return calculateTokenLoanLtvByLoanValue(newLoan, debtValue)
}
