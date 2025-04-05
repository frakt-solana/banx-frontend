import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { convertBondOfferV3ToCore } from '@banx/api'
import { TokenLoan } from '@banx/api'
import { useTokenBondOffers } from '@banx/hooks'
import { useTokenLoansOptimistic } from '@banx/store'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowTokenRefinanceTxnDataParams,
  createBorrowTokenRefinanceTxnData,
  parseBorrowTokenRefinanceSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useLoansState } from '../../hooks'

export const useRefinanceTokenModal = (loan: TokenLoan) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()
  const { clear: clearSelection } = useLoansState()
  const { close: closeModal } = useModal()

  const lendingToken = loan.bondTradeTransaction.lendingToken

  const { offers, updateOrAddOptimisticOffer, isLoading } = useTokenBondOffers({
    marketPubkey: loan.fraktBond.hadoMarket
      ? new web3.PublicKey(loan.fraktBond.hadoMarket)
      : undefined,
    lendingTokenType: lendingToken,
    excludeWallet: wallet.publicKey || undefined,
  })

  const refinance = async (offer: BondOfferV3, tokensToRefinance: BN) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowTokenRefinanceTxnData(
        {
          loan,
          offer: convertBondOfferV3ToCore(offer),
          solToRefinance: tokensToRefinance,
          aprRate: offer.loanApr,
          tokenType: lendingToken,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateBorrowTokenRefinanceTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully refinanced',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondOffer, bondTradeTransaction, fraktBond } =
                parseBorrowTokenRefinanceSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                ...params.loan,
                publicKey: fraktBond.publicKey,
                bondTradeTransaction,
                fraktBond: {
                  ...fraktBond,
                  hadoMarket: params.loan.fraktBond.hadoMarket,
                },
              }

              updateOrAddOptimisticOffer(bondOffer)
              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
              closeModal()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceTokenBorrow',
      })
    }
  }

  return {
    offers,
    isLoading,
    refinance,
    lendingToken,
  }
}
