import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { MARKET_OPTIONS_WITHOUT_ALL, TokenDropdown } from '@banx/components/Dropdowns'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'
import { InputErrorMessage, NumericStepInput } from '@banx/components/inputs'

import { useTokenType } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimUserEscrowTxnDataParams,
  createClaimUserEscrowTxnData,
  parseClaimUserEscrowSimulatedAccounts,
} from '@banx/transactions/escrow'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils/snackbar'
import { getTokenUnit, isBanxSolTokenType } from '@banx/utils/tokens'

import { BanxSolEpochContent, EscrowTabs } from './components'
import { TabName, useUserEscrowContent, useUserEscrowInfo } from './hooks'

import styles from './Escrow.module.scss'

export const Escrow = () => {
  const {
    inputValue,
    setInputValue,
    activeTab,
    onTabClick,
    onActionClick,
    walletBalance,
    escrowBalance,
    errorMessage,
  } = useUserEscrowContent()

  const { tokenType, setTokenType } = useTokenType()

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Escrow
          <Tooltip title="With escrow, lenders can make an unlimited number of offers, as long as each offer doesn’t exceed the escrow balance" />
        </h3>
        <TokenDropdown
          option={tokenType}
          onChange={setTokenType}
          options={MARKET_OPTIONS_WITHOUT_ALL}
          size="small"
        />
      </div>

      <EscrowTabs
        tab={activeTab}
        setTab={onTabClick}
        walletBalance={walletBalance}
        escrowBalance={escrowBalance}
      />

      <NumericStepInput
        value={inputValue}
        onChange={setInputValue}
        postfix={getTokenUnit(tokenType)}
      />

      <div className={styles.errorMessageContainer}>
        {errorMessage && <InputErrorMessage message={errorMessage} />}
      </div>

      <div className={styles.actionWrapper}>
        <Button
          className={styles.actionButton}
          onClick={onActionClick}
          size="medium"
          disabled={!!errorMessage || parseFloat(inputValue) === 0}
        >
          {activeTab === TabName.Wallet ? 'Deposit' : 'Withdraw'}
        </Button>
      </div>
    </div>
  )
}

export const ClaimSection = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { userEscrow, updateUserEscrowOptimistic, userEscrowInfo, clusterStats } =
    useUserEscrowInfo()

  const { totalClaimAmount, repaymentsAmount, interestRewardsAmount, rentRewards, totalLstYield } =
    userEscrowInfo

  const claim = async () => {
    if (totalClaimAmount <= 0 || !userEscrow || !clusterStats) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimUserEscrowTxnData(
        { userEscrow, clusterStats },
        walletAndConnection,
      )

      await new TxnExecutor<CreateClaimUserEscrowTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Successfully claimed', type: 'success' })
            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userEscrow = parseClaimUserEscrowSimulatedAccounts(accountInfoByPubkey)

              updateUserEscrowOptimistic({
                walletPubkey: walletAndConnection.wallet.publicKey.toBase58(),
                updatedUserEscrow: userEscrow,
              })
            })
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimUserEscrow',
      })
    }
  }

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={repaymentsAmount} />
      <TooltipRow label="Accrued interest" value={interestRewardsAmount} />
      <TooltipRow label="Rent rewards" value={rentRewards} />
      {isBanxSolTokenType(tokenType) && (
        <TooltipRow label="Total LST Yield" value={totalLstYield} />
      )}
    </div>
  )

  const isBanxSol = userEscrow?.lendingTokenType === LendingTokenType.BanxSol

  return (
    <div className={styles.claimSection}>
      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.epochContent]: isBanxSol,
        })}
      >
        <div className={styles.lenderVaultStats}>
          {isBanxSol && <BanxSolEpochContent />}
          <StatInfo
            label="Available to claim"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalClaimAmount} />}
            classNamesProps={{
              container: styles.lenderVaultStatContainer,
              label: styles.lenderVaultStatLabel,
              value: styles.lenderVaultStatValue,
            }}
            flexType="row"
          />
        </div>
        <Button onClick={claim} disabled={!totalClaimAmount} size="medium">
          Claim
        </Button>
      </div>
    </div>
  )
}

interface TooltipRowProps {
  label: string
  value: number
}

const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)
