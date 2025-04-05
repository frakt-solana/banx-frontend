import { FC } from 'react'

import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { useModal } from '@banx/store'
import { formatValueByTokenType, getTokenUnit } from '@banx/utils'

import styles from './EscrowWarningModal.module.scss'

interface EscrowWarningModalProps {
  onSubmit: (amount?: BN) => void
  escrowBalance: number
  offerSize: number
  lendingToken: LendingTokenType
}

export const EscrowWarningModal: FC<EscrowWarningModalProps> = ({
  onSubmit,
  escrowBalance,
  offerSize,
  lendingToken,
}) => {
  const { close: closeModal } = useModal()

  const tokenUnit = getTokenUnit(lendingToken)

  const amountToUpdate = offerSize - escrowBalance

  const formattedValues = {
    escrowBalance: formatValueByTokenType(escrowBalance, lendingToken) || '0',
    offerSize: formatValueByTokenType(offerSize, lendingToken) || '0',
    amountToUpdate: formatValueByTokenType(amountToUpdate, lendingToken) || '0',
  }

  const displayEscrowBalance = createDisplayValueJSX(formattedValues.escrowBalance, tokenUnit)
  const displayOfferSize = createDisplayValueJSX(formattedValues.offerSize, tokenUnit)
  const displayAmountToUpdate = createDisplayValueJSX(formattedValues.amountToUpdate, tokenUnit)

  return (
    <Modal className={styles.modal} open onCancel={closeModal} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        You only have {displayEscrowBalance} in escrow instead of {displayOfferSize} size you want
      </p>

      <div className={styles.actionsButtons}>
        <Button
          onClick={() => onSubmit(new BN(amountToUpdate))}
          className={styles.actionButton}
          variant="secondary"
        >
          <span>Deposit {displayAmountToUpdate} to escrow</span>
        </Button>

        <Button onClick={() => onSubmit()} className={styles.actionButton} variant="secondary">
          Proceed
        </Button>
      </div>
    </Modal>
  )
}
