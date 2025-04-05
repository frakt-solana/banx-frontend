import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { core } from '@banx/api/tokens'
import { useTokenBondOffers } from '@banx/hooks'
import {
  calculateLentTokenValueWithInterest,
  formatValueByTokenType,
  getTokenDecimals,
  getTokenUnit,
  isTokenLoanActive,
  isTokenLoanSelling,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useLenderTokenLoansTransactions } from '../../../hooks'
import { calculateFreezeExpiredAt, checkIfFreezeExpired, findBestOffer } from './helpers'

import styles from './ManageModal.module.scss'

export const ClosureContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const { publicKey } = useWallet()

  const lendingToken = loan.bondTradeTransaction.lendingToken
  const marketPubkey = loan.fraktBond.hadoMarket || ''

  const { instantTokenLoan, terminateTokenLoan, revertTerminateTokenLoan } =
    useLenderTokenLoansTransactions()

  const {
    offers,
    updateOrAddOptimisticOffer,
    isLoading: isLoadingOffers,
  } = useTokenBondOffers({
    marketPubkey: marketPubkey ? new web3.PublicKey(marketPubkey) : undefined,
    lendingTokenType: lendingToken,
    excludeWallet: publicKey || undefined,
  })

  const lendingTokenDecimals = getTokenDecimals(lendingToken)

  const bestOffer = useMemo(() => {
    return findBestOffer({
      loan,
      offers,
      walletPubkey: publicKey?.toBase58() || '',
      lendingTokenDecimals,
    })
  }, [loan, offers, lendingTokenDecimals, publicKey])

  const loanStatus = {
    isActive: isTokenLoanActive(loan),
    isSelling: isTokenLoanSelling(loan),
    isTerminating: isTokenLoanTerminating(loan),
  }

  const canRefinance = !isEmpty(bestOffer) && !loanStatus.isTerminating

  const canList = !loanStatus.isTerminating && !loanStatus.isSelling

  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const isFreezeExpired = checkIfFreezeExpired(loan)

  const lentValue = calculateLentTokenValueWithInterest(loan).toNumber()

  const handleInstantLoan = async () => {
    if (!bestOffer) return
    await instantTokenLoan(loan, bestOffer, updateOrAddOptimisticOffer)
  }

  const handleListLoan = async () => {
    if (loanStatus.isSelling) {
      return await revertTerminateTokenLoan(loan)
    }

    return await terminateTokenLoan(loan, false)
  }

  const handleTerminateLoan = async () => {
    if (loanStatus.isTerminating) {
      return await revertTerminateTokenLoan(loan)
    }

    return await terminateTokenLoan(loan)
  }

  return (
    <div className={styles.closureContent}>
      <ExitContentInfo
        exitValue={lentValue}
        onActionClick={handleInstantLoan}
        isLoading={isLoadingOffers}
        tokenType={lendingToken}
        disabled={!canRefinance || !isFreezeExpired}
      />

      <ListLoanContentInfo
        onActionClick={handleListLoan}
        disabled={!canList || !isFreezeExpired}
        isLoanSelling={loanStatus.isSelling}
      />

      <TerminateContentInfo
        onActionClick={handleTerminateLoan}
        isLoanTerminating={loanStatus.isTerminating}
        disabled={!isFreezeExpired}
      />

      {!isFreezeExpired && <TimerContent expiredAt={freezeExpiredAt} />}
    </div>
  )
}

interface ExitContentInfoProps {
  onActionClick: () => Promise<void>
  disabled: boolean
  exitValue: number

  isLoading: boolean
  tokenType: LendingTokenType
}

const ExitContentInfo: FC<ExitContentInfoProps> = ({
  onActionClick,
  disabled,
  exitValue,
  isLoading,
  tokenType,
}) => {
  const tokenUnit = getTokenUnit(tokenType)

  const formattedExitValue = formatValueByTokenType(exitValue, tokenType)

  const displayExitValueJSX = !disabled ? (
    <div className={styles.exitValue}>
      Exit + {createDisplayValueJSX(formattedExitValue, tokenUnit)}
    </div>
  ) : (
    <>No offers</>
  )

  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>Exit</h3>
        <p>Instantly receive your total claim</p>
      </div>

      {isLoading && <Skeleton.Button className={styles.skeletonButton} />}

      {!isLoading && (
        <Button
          onClick={onActionClick}
          className={styles.actionButton}
          disabled={disabled}
          variant="secondary"
        >
          {displayExitValueJSX}
        </Button>
      )}
    </div>
  )
}

interface ListLoanContentInfo {
  onActionClick: () => Promise<void>
  isLoanSelling: boolean
  disabled: boolean
}

const ListLoanContentInfo: FC<ListLoanContentInfo> = ({
  onActionClick,
  isLoanSelling,
  disabled,
}) => {
  const buttonText = isLoanSelling ? 'Delist' : 'List'

  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>List loan</h3>
        <p>Receive your total claim after new lender funds loan</p>
      </div>

      <Button
        className={styles.actionButton}
        onClick={onActionClick}
        disabled={!isLoanSelling && disabled} //? Disable only if not selling
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}

interface TerminateContentInfo {
  onActionClick: () => Promise<void>
  isLoanTerminating: boolean
  disabled: boolean
}

const TerminateContentInfo: FC<TerminateContentInfo> = ({
  onActionClick,
  isLoanTerminating,
  disabled,
}) => {
  return (
    <div className={styles.closureContentInfo}>
      <div className={styles.closureContentTexts}>
        <h3>Terminate</h3>
        <p>
          Send your loan to refinancing auction to seek new lenders. If successful you will receive
          repayment in escrow. If unsuccessful after 72 hours you will receive the collateral
          instead
        </p>
      </div>

      <Button
        className={classNames(styles.actionButton, styles.terminateButton)}
        onClick={onActionClick}
        disabled={disabled}
        variant="secondary"
      >
        {isLoanTerminating ? 'Cancel' : 'Terminate'}
      </Button>
    </div>
  )
}

const TimerContent: FC<{ expiredAt: number }> = ({ expiredAt }) => (
  <div className={styles.freezeTimerWrapper}>
    Exit, list and termination are frozen for <Timer expiredAt={expiredAt} />
  </div>
)
