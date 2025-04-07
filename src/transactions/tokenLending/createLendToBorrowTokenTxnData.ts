import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
  updateLiquidityToUserVault as updateLiquidityToUserEscrow,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Loan, UserEscrow } from '@banx/api'
import { BONDS } from '@banx/constants'
import {
  ZERO_BN,
  calculateTokenLoanRepayValueOnCertainDate,
  calculateTokenLoanValueWithUpfrontFee,
  isBanxSolTokenType,
  isLoanListed,
  removeDuplicatedPublicKeys,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'
import { banxSol } from '../index'

type CreateBulkLendToBorrowTokenTxnsData = (
  params: {
    loans: Loan[]
    userEscrow: UserEscrow | undefined
  },
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>[]>

export const createBulkLendToBorrowTokenTxnsData: CreateBulkLendToBorrowTokenTxnsData = async (
  { loans, userEscrow },
  walletAndConnection,
) => {
  const { txnDataPromises } = loans.reduce(
    (
      acc: {
        restEscrowBalance: BN
        txnDataPromises: Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>[]
      },
      loan,
    ) => {
      const isListed = isLoanListed(loan)

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

      if (loanValue.lte(acc.restEscrowBalance)) {
        const fundsFromEscrow = loanValue

        const promise = createTxnFunc(
          { loan, fundsFromEscrow, fundsFromWallet: ZERO_BN },
          walletAndConnection,
        )

        return {
          txnDataPromises: [...acc.txnDataPromises, promise],
          restEscrowBalance: acc.restEscrowBalance.sub(fundsFromEscrow),
        }
      } else {
        const fundsFromEscrow = acc.restEscrowBalance

        const promise = createTxnFunc(
          { loan, fundsFromEscrow, fundsFromWallet: loanValue.sub(fundsFromEscrow) },
          walletAndConnection,
        )

        return {
          txnDataPromises: [...acc.txnDataPromises, promise],
          restEscrowBalance: ZERO_BN,
        }
      }
    },
    {
      restEscrowBalance: userEscrow?.offerLiquidityAmount || ZERO_BN,
      txnDataPromises: [],
    },
  )

  return await Promise.all(txnDataPromises)
}

export type CreateLendToBorrowTokenTxnDataParams = {
  loan: Loan
  fundsFromWallet: BN
  fundsFromEscrow: BN
}

type CreateLendToBorrowTokenTxnData = (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>

const createLendToBorrowListingTxnData: CreateLendToBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, fundsFromEscrow } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan
  const lendingTokenType = bondTradeTransaction.lendingToken

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []
  const lookupTables: web3.PublicKey[] = []
  const accounts: web3.PublicKey[] = [new web3.PublicKey(LOOKUP_TABLE)]

  if (!fundsFromEscrow.isZero()) {
    const {
      instructions: updateUserEscrowInstructions,
      signers: updateUserEscrowSigners,
      accounts: updateUserEscrowAccounts,
    } = await updateLiquidityToUserEscrow({
      connection,
      args: {
        amount: fundsFromEscrow,
        lendingTokenType,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateUserEscrowInstructions)
    signers.push(...updateUserEscrowSigners)
    accounts.push(updateUserEscrowAccounts.lenderVault)
  }

  if (isBanxSolTokenType(lendingTokenType) && !fundsFromEscrow.isZero()) {
    const { instructions: swapInstructions, lookupTables: swapLookupTables } =
      await banxSol.getSwapBanxSolToSolInstructions({
        inputAmount: fundsFromEscrow,
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
  const { loan, fundsFromWallet, fundsFromEscrow } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []
  const lookupTables: web3.PublicKey[] = []
  const accounts: web3.PublicKey[] = [new web3.PublicKey(LOOKUP_TABLE)]

  if (!fundsFromEscrow.isZero()) {
    const {
      instructions: updateUserEscrowInstructions,
      signers: updateUserEscrowSigners,
      accounts: updateUserEscrowAccounts,
    } = await updateLiquidityToUserEscrow({
      connection,
      args: {
        amount: fundsFromEscrow,
        lendingTokenType: bondTradeTransaction.lendingToken,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateUserEscrowInstructions)
    signers.push(...updateUserEscrowSigners)
    accounts.push(updateUserEscrowAccounts.lenderVault)
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
