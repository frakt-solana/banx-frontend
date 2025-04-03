import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { TooltipWrapper } from '@banx/components/Tooltip'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'

import { TokenLoan } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import RefinanceModal from '../LenderTokenRefinanceModal/LenderTokenRefinanceModal'

import styles from '../page.module.scss'

interface ActionsCellProps {
  loan: TokenLoan
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

    return openModal(RefinanceModal, { loans: [loan] })
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
