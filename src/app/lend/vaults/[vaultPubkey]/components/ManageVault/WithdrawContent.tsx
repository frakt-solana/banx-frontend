import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'
import { Modal } from '@banx/components/modals/BaseModal'

import { VaultPreview } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { getTokenDecimals, stringToBN } from '@banx/utils'

import { Input } from '..'
import { useLiquidityPoolTxns } from '../../hooks'

import styles from './ManageVault.module.scss'

interface WithdrawContentProps {
  vaultPreview: VaultPreview
}

export const WithdrawContent: FC<WithdrawContentProps> = ({ vaultPreview }) => {
  const { userTotalDepositedAmount, requestedWithdrawAmount, reserves, lendingToken } = vaultPreview

  const { connected } = useWallet()
  const { open: openModal } = useModal()
  const { setVisible } = useWalletSidebar()

  const { withdraw } = useLiquidityPoolTxns(vaultPreview)

  const tokenDecimals = getTokenDecimals(lendingToken)

  const [withdrawAmountInput, setWithdrawAmountInput] = useState('')

  const withdrawAmount = parseFloat(withdrawAmountInput) * 10 ** tokenDecimals

  const showWarningMessage = (() => {
    if (!userTotalDepositedAmount || !withdrawAmount) {
      return false
    }
    return withdrawAmount > reserves
  })()

  const executeWithdraw = async () => {
    await withdraw({
      amount: stringToBN(withdrawAmountInput, tokenDecimals),
      onSuccess: () => setWithdrawAmountInput(''),
    })
  }

  const handleWithdrawClick = async () => {
    if (!connected) {
      setVisible(true)
      return
    }

    if (showWarningMessage) {
      openModal(WarningModal, {
        vaultPreview,
        withdrawAmount,
        onSumbit: executeWithdraw,
      })
      return
    }

    return await executeWithdraw()
  }

  const availableWithdrawBalance = Math.max(0, userTotalDepositedAmount - requestedWithdrawAmount)

  const isWithdrawDisabled = (() => {
    const enteredAmount = parseFloat(withdrawAmountInput)
    if (!connected || !enteredAmount) return true

    const maxWithdrawable = availableWithdrawBalance / 10 ** tokenDecimals
    return enteredAmount > maxWithdrawable
  })()

  return (
    <div className={styles.withdrawContent}>
      {requestedWithdrawAmount > 0 && (
        <PendingWithdrawRequest amount={requestedWithdrawAmount} lendingToken={lendingToken} />
      )}

      <Input
        label="You get"
        value={withdrawAmountInput}
        onChange={setWithdrawAmountInput}
        tokenType={lendingToken}
        maxValue={availableWithdrawBalance}
      />

      <Button
        onClick={handleWithdrawClick}
        className={styles.withdrawButton}
        disabled={isWithdrawDisabled}
      >
        {!connected ? 'Connect wallet' : 'Withdraw'}
      </Button>
    </div>
  )
}

interface PendingWithdrawRequestProps {
  amount: number
  lendingToken: LendingTokenType
}

const PendingWithdrawRequest: FC<PendingWithdrawRequestProps> = ({ amount, lendingToken }) => (
  <div className={styles.pendingWithdrawRequest}>
    <DisplayValue value={amount} strictTokenType={lendingToken} />
    <span>requested</span>
  </div>
)

interface WarningModalProps {
  vaultPreview: VaultPreview
  withdrawAmount: number
  onSumbit: () => void
}

const WarningModal: FC<WarningModalProps> = ({ vaultPreview, withdrawAmount, onSumbit }) => {
  const { reserves, lendingToken } = vaultPreview

  const { close: closeModal } = useModal()

  const availableToClaim = Math.min(withdrawAmount, reserves)
  const pendingAmount = withdrawAmount - availableToClaim

  return (
    <Modal open onCancel={closeModal} width={496}>
      <div className={styles.warningModalContent}>
        <h3 className={styles.warningModalTitle}>Please pay attention!</h3>
        <span className={styles.warningModalText}>
          Claim {<DisplayValue value={availableToClaim} strictTokenType={lendingToken} />} now. Send
          request for {<DisplayValue value={pendingAmount} strictTokenType={lendingToken} />}{' '}
          currently in use and be notified when funds are deposited into escrow
        </span>
      </div>
      <div className={styles.actionButtons}>
        <Button onClick={closeModal} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={onSumbit} className={styles.approveButton}>
          Claim and send request
        </Button>
      </div>
    </Modal>
  )
}
