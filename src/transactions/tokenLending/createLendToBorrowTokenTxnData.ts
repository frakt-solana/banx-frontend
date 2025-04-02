import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
  updateLiquidityToUserVault,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { UserVault } from '@banx/api'
import { TokenLoan } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import {
  ZERO_BN,
  calculateTokenLoanRepayValueOnCertainDate,
  calculateTokenLoanValueWithUpfrontFee,
  isBanxSolTokenType,
  isTokenLoanListed,
  removeDuplicatedPublicKeys,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'
import { banxSol } from '../index'

type CreateBulkLendToBorrowTokenTxnsData = (
  params: {
    loans: TokenLoan[]
    userVault: UserVault | undefined
  },
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>[]>

export const createBulkLendToBorrowTokenTxnsData: CreateBulkLendToBorrowTokenTxnsData = async (
  { loans, userVault },
  walletAndConnection,
) => {
  const { txnDataPromises } = loans.reduce(
    (
      acc: {
        restVaultBalance: BN
        txnDataPromises: Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>[]
      },
      loan,
    ) => {
      const isListed = isTokenLoanListed(loan)

      const loanValue = isListed
        ? calculateTokenLoanValueWithUpfrontFee(loan)
        : calculateTokenLoanRepayValueOnCertainDate({
            loan,
            //? It is necessary to add some time because interest is accumulated even during the transaction processing.
            //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
            date: moment().unix() + 180,
          })

      const createTxnFunc = isListed
        ? createLendToBorrowListingTxnData
        : createRefinancePerpetualLoanTxnData

      if (loanValue.lte(acc.restVaultBalance)) {
        const fundsFromVault = loanValue

        const promise = createTxnFunc(
          { loan, fundsFromVault, fundsFromWallet: ZERO_BN },
          walletAndConnection,
        )

        return {
          txnDataPromises: [...acc.txnDataPromises, promise],
          restVaultBalance: acc.restVaultBalance.sub(fundsFromVault),
        }
      } else {
        const fundsFromVault = acc.restVaultBalance

        const promise = createTxnFunc(
          { loan, fundsFromVault, fundsFromWallet: loanValue.sub(fundsFromVault) },
          walletAndConnection,
        )

        return {
          txnDataPromises: [...acc.txnDataPromises, promise],
          restVaultBalance: ZERO_BN,
        }
      }
    },
    {
      restVaultBalance: userVault?.offerLiquidityAmount || ZERO_BN,
      txnDataPromises: [],
    },
  )

  return await Promise.all(txnDataPromises)
}

export type CreateLendToBorrowTokenTxnDataParams = {
  loan: TokenLoan
  fundsFromWallet: BN
  fundsFromVault: BN
}

type CreateLendToBorrowTokenTxnData = (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>

const createLendToBorrowListingTxnData: CreateLendToBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, fundsFromVault } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan
  const lendingTokenType = bondTradeTransaction.lendingToken

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []
  const lookupTables: web3.PublicKey[] = []
  const accounts: web3.PublicKey[] = [new web3.PublicKey(LOOKUP_TABLE)]

  if (!fundsFromVault.isZero()) {
    const {
      instructions: updateLiquidityIxns,
      signers: updateLiquiditySigners,
      accounts: updateLiquidityAccounts,
    } = await updateLiquidityToUserVault({
      connection,
      args: {
        amount: fundsFromVault,
        lendingTokenType,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateLiquidityIxns)
    signers.push(...updateLiquiditySigners)
    accounts.push(updateLiquidityAccounts.lenderVault)
  }

  if (isBanxSolTokenType(lendingTokenType) && !fundsFromVault.isZero()) {
    const { instructions: swapInstructions, lookupTables: swapLookupTables } =
      await banxSol.getSwapBanxSolToSolInstructions({
        inputAmount: fundsFromVault,
        walletAndConnection,
      })

    instructions.push(...swapInstructions)
    lookupTables.push(...swapLookupTables)
  }

  const {
    instructions: lendToBorrowIxns,
    signers: lendToBorrowSigners,
    accounts: lendToBorrowAccounts,
  } = await lendToBorrowerListing({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      borrower: new web3.PublicKey(fraktBond.fbondIssuer),
      userPubkey: wallet.publicKey,
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      oraclePriceFeed: loan.collateral.oraclePriceFeed
        ? new web3.PublicKey(loan.collateral.oraclePriceFeed)
        : undefined,
    },
    args: {
      lendingTokenType,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...lendToBorrowIxns)
  signers.push(...lendToBorrowSigners)
  accounts.push(...Object.values(lendToBorrowAccounts))

  return {
    params,
    instructions,
    signers,
    lookupTables: removeDuplicatedPublicKeys(lookupTables),
  }
}

const createRefinancePerpetualLoanTxnData: CreateLendToBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, fundsFromWallet, fundsFromVault } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []
  const lookupTables: web3.PublicKey[] = []
  const accounts: web3.PublicKey[] = [new web3.PublicKey(LOOKUP_TABLE)]

  if (!fundsFromVault.isZero()) {
    const {
      instructions: updateLiquidityIxns,
      signers: updateLiquiditySigners,
      accounts: updateLiquidityAccounts,
    } = await updateLiquidityToUserVault({
      connection,
      args: {
        amount: fundsFromVault,
        lendingTokenType: bondTradeTransaction.lendingToken,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateLiquidityIxns)
    signers.push(...updateLiquiditySigners)
    accounts.push(updateLiquidityAccounts.lenderVault)
  }

  //? refinancePerpetualLoan txn needs BanxSol. Swap lack of banxSol using sol from wallet
  if (isBanxSolTokenType(bondTradeTransaction.lendingToken) && !fundsFromWallet.isZero()) {
    const { instructions: swapInstructions, lookupTables: swapLookupTables } =
      await banxSol.getSwapSolToBanxSolInstructions({
        inputAmount: fundsFromWallet,
        walletAndConnection,
      })

    instructions.push(...swapInstructions)
    lookupTables.push(...swapLookupTables)
  }

  const {
    instructions: refinanceIxns,
    signers: refinanceSigners,
    accounts: refinanceAccounts,
  } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: new BN(bondTradeTransaction.amountOfBonds),
      newLiqLtv: new BN(loan.liquidationLtvBp),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...refinanceIxns)
  signers.push(...refinanceSigners)
  accounts.push(...Object.values(refinanceAccounts))

  return { params, instructions, signers, lookupTables: removeDuplicatedPublicKeys(lookupTables) }
}
