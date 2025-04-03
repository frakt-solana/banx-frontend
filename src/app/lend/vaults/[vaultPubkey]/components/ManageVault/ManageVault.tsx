import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { useUserEscrow, useWalletSidebar } from '@banx/components/WalletAccountSidebar'

import { VaultPreview } from '@banx/api/tokens'
import { useWalletBalance } from '@banx/hooks'
import { getTokenDecimals, stringToBN } from '@banx/utils'

import { Input } from '..'
import { useLiquidityPoolTxns } from '../../hooks'
import { WithdrawContent } from './WithdrawContent'

import styles from './ManageVault.module.scss'

enum TabName {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

const TABS = [
  {
    label: 'Deposit',
    value: TabName.Deposit,
  },
  {
    label: 'Withdraw',
    value: TabName.Withdraw,
  },
]

export const ManageVault: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.Deposit,
  })

  return (
    <div className={styles.manageVaultContent}>
      <Tabs value={currentTabValue} {...tabsProps} className={styles.manageVaultTabs} />
      {currentTabValue === TabName.Deposit && <DepositContent vaultPreview={vaultPreview} />}
      {currentTabValue === TabName.Withdraw && <WithdrawContent vaultPreview={vaultPreview} />}
    </div>
  )
}

const DepositContent: FC<{ vaultPreview: VaultPreview }> = ({ vaultPreview }) => {
  const { lendingToken } = vaultPreview

  const { connected } = useWallet()
  const { setVisible } = useWalletSidebar()

  const tokenDecimals = getTokenDecimals(lendingToken)
  const walletBalance = useWalletBalance(lendingToken)

  const { userEscrow } = useUserEscrow()
  const { deposit } = useLiquidityPoolTxns(vaultPreview)

  const [depositInputValue, setDepositInputValue] = useState('')

  const onActionClick = async () => {
    if (!connected) {
      return setVisible(true)
    }

    const depositAmount = stringToBN(depositInputValue, tokenDecimals)
    await deposit({
      amount: depositAmount,
      onSuccess: () => setDepositInputValue(''),
    })
  }

  const fullBalance = userEscrow
    ? walletBalance + userEscrow?.offerLiquidityAmount?.toNumber()
    : walletBalance

  const isActionDisabled = (() => {
    const inputAmount = parseFloat(depositInputValue)
    const isValidAmount = inputAmount > 0
    const isBalanceSufficient = inputAmount <= fullBalance / 10 ** tokenDecimals

    return connected && (!isValidAmount || !isBalanceSufficient)
  })()

  return (
    <div className={styles.depositContent}>
      <Input
        label="Deposit"
        value={depositInputValue}
        onChange={setDepositInputValue}
        tokenType={lendingToken}
        maxValue={fullBalance}
      />
      <Button onClick={onActionClick} className={styles.depositButton} disabled={isActionDisabled}>
        {connected ? 'Deposit' : 'Connect wallet'}
      </Button>
    </div>
  )
}
