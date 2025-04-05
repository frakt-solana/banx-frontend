import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { useUserEscrow, useWalletSidebar } from '@banx/components/WalletAccountSidebar'
import { EscrowWarningModal } from '@banx/components/modals/EscrowWarningModal'

import { useModal } from '@banx/store/common'
import { getTokenDecimals } from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.scss'

interface ActionButtonsProps {
  isEditMode: boolean
  lendingToken: LendingTokenType
  offerSize: number //? normal number

  createOffer: (amount?: BN) => void
  updateOffer: (amount?: BN) => void
  removeOffer: () => void

  disableUpdateOffer: boolean
  disablePlaceOffer: boolean
}

export const ActionsButtons: FC<ActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  disablePlaceOffer,
  createOffer,
  removeOffer,
  updateOffer,
  offerSize,
  lendingToken,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletSidebar()
  const { open: openModal } = useModal()
  const { userEscrow } = useUserEscrow()

  const lendingTokenDecimals = getTokenDecimals(lendingToken)
  const escrowBalance = userEscrow?.offerLiquidityAmount.toNumber() || 0

  const handleModalSubmission = (amount?: BN) =>
    isEditMode ? updateOffer(amount) : createOffer(amount)

  const openWarningModal = () =>
    openModal(EscrowWarningModal, {
      escrowBalance,
      onSubmit: handleModalSubmission,
      offerSize: offerSize * 10 ** lendingTokenDecimals,
      lendingToken,
    })

  const shouldShowWarningModal = offerSize * 10 ** lendingTokenDecimals > escrowBalance

  const handleMainActionClick = () => {
    if (shouldShowWarningModal) {
      return openWarningModal()
    }

    return connected ? createOffer() : toggleVisibility()
  }

  const handleUpdateActionClick = () => {
    if (shouldShowWarningModal) {
      return openWarningModal()
    }

    return updateOffer()
  }

  return (
    <div className={styles.actionsButtonsContainer}>
      {isEditMode ? (
        <div className={styles.editModeButtons}>
          <Button
            variant="secondary"
            onClick={removeOffer}
            className={classNames(styles.actionButton, styles.removeOfferButton)}
          >
            Remove
          </Button>
          <Button
            onClick={handleUpdateActionClick}
            className={styles.actionButton}
            disabled={disableUpdateOffer}
          >
            Apply changes
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleMainActionClick}
          className={styles.placeOfferButton}
          disabled={connected && disablePlaceOffer}
        >
          {connected ? 'Place' : 'Connect wallet'}
        </Button>
      )}
    </div>
  )
}
