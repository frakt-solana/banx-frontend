import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import { TooltipWrapper } from '@banx/components/Tooltip'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'

import { Loan } from '@banx/api'
import { useModal } from '@banx/store'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils/colors'
import { calculateTokenLoanLtvByLoanValue } from '@banx/utils/core'

import { calculateLendToBorrowValue } from '../../helpers'
import { LenderRefinanceModal } from '../LenderRefinanceModal'

import styles from './LoansMarketTable.module.scss'

interface DebtCellProps {
  loan: Loan
}

export const DebtCell: FC<DebtCellProps> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)

  return <HorizontalCell value={<DisplayValue value={lentValue} />} />
}

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)
  const ltv = calculateTokenLoanLtvByLoanValue(loan, lentValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: Loan }> = ({ loan }) => {
  return (
    <HorizontalCell
      value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
      isHighlighted
    />
  )
}

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
  disabledAction: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView, disabledAction }) => {
  const { publicKey, connected } = useWallet()
  const { open: openModal } = useModal()
  const { toggleVisibility } = useWalletSidebar()

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    return openModal(LenderRefinanceModal, { loans: [loan] })
  }

  const isOwnLoan = loan.bondTradeTransaction.user === publicKey?.toBase58()

  return (
    <div className={classNames(styles.actionsCell, { [styles.cardView]: isCardView })}>
      <TooltipWrapper title={isOwnLoan ? "You can't lend to your own loan" : ''}>
        <Button
          className={styles.actionButton}
          onClick={onClickHandler}
          size={isCardView ? 'large' : 'medium'}
          disabled={disabledAction || isOwnLoan}
        >
          Lend
        </Button>
      </TooltipWrapper>
    </div>
  )
}
