import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond, Offer } from '@banx/api'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { ZERO_BN, calculateTokenLoanRepayValueOnCertainDate, isBanxSolTokenType } from '@banx/utils'

import { banxSol } from '..'
import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateBorrowTokenRefinanceTxnDataParams = {
  loan: core.TokenLoan
  offer: Offer
  solToRefinance: BN
  aprRate: BN
  tokenType: LendingTokenType
}

type CreateBorrowTokenRefinanceTxnData = (
  params: CreateBorrowTokenRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTokenRefinanceTxnDataParams>>

export const createBorrowTokenRefinanceTxnData: CreateBorrowTokenRefinanceTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, offer, aprRate, solToRefinance, tokenType } = params

  const { instructions, signers, accountsCollection } = await getIxnsAndSigners(
    {
      loan,
      offer,
      aprRate,
      solToRefinance,
      tokenType,
    },
    walletAndConnection,
  )

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]
  const accounts = [
    accountsCollection['bondOffer'],
    accountsCollection['fraktBond'],
    accountsCollection['bondTradeTransaction'],
  ]

  if (isBanxSolTokenType(tokenType)) {
    const newLoanDebt = new BN(solToRefinance)
    const currentLoanDebt = calculateTokenLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    const upfrontFee = BN.max(
      newLoanDebt
        .sub(currentLoanDebt)
        .mul(new BN(loan.collateral.upfrontFee))
        .div(new BN(BASE_POINTS)),
      ZERO_BN,
    )

    const diff = newLoanDebt.sub(currentLoanDebt).sub(upfrontFee)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithSellBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff,
          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }

    return await banxSol.combineWithBuyBanxSolInstructions(
      { params, accounts, inputAmount: diff.abs(), instructions, signers, lookupTables },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

const getIxnsAndSigners = async (
  params: CreateBorrowTokenRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, offer, solToRefinance, aprRate } = params
  const { connection, wallet } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const accounts = {
    fbond: new web3.PublicKey(fraktBond.publicKey),
    newLender: new web3.PublicKey(offer.assetReceiver),
    userPubkey: wallet.publicKey,
    hadoMarket: new web3.PublicKey(offer.hadoMarket),
    protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
    bondOffer: new web3.PublicKey(offer.publicKey),
    previousLender: new web3.PublicKey(bondTradeTransaction.user),
    oraclePriceFeed: loan.collateral.oraclePriceFeed
      ? new web3.PublicKey(loan.collateral.oraclePriceFeed)
      : undefined,
  }

  if (
    offer.publicKey === bondTradeTransaction.bondOffer &&
    offer.pairState === PairState.PerpetualBondingCurveOnMarket
  ) {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowerRefinanceToSame({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts,
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, accountsCollection }
  } else {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowerRefinance({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts: {
        ...accounts,
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      },
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, accountsCollection }
  }
}

export const parseBorrowTokenRefinanceSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)
  const resultsBN = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return {
    bondOffer: resultsBN?.['bondOfferV3']?.[0] as BondOfferV3,
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
