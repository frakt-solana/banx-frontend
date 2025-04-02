import { createJupiterApiClient } from '@jup-ag/api'
import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  getBurnLrtsInstructions,
  getUnstakedSolAresteaVaulBalance,
} from 'fbonds-core/lib/fbond-protocol/functions/multiply'
import { sellToRepay } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { SimulatedAccountInfoByPubkey } from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond } from '@banx/api'
import { DEFAULT_JUP_QUOTE_PARAMS } from '@banx/api/common'
import { BONDS, WSOL_ADDRESS } from '@banx/constants'
import { parseAccountInfoByPubkey, sendTxnPlaceHolder } from '@banx/transactions'
import { getJupSwapIxns } from '@banx/transactions/jup'
import { createRepayTokenLoanTxnData } from '@banx/transactions/tokenLending'
import { caclulateBorrowTokenLoanValue } from '@banx/utils'

import { SSOL_MINT } from '.'
import { CreateSellToRepayTokenLoanTxnData } from '../common/createSellToRepayTokenLoanTxnData'

export const createLrtsSellToRepayTokenLoanTxnData: CreateSellToRepayTokenLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, pair, expectedCollateralConversionRate, slippageBps } = params

  const { bondTradeTransaction, fraktBond } = loan

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const lookupTables: web3.PublicKey[] = [new web3.PublicKey(LOOKUP_TABLE)]
  const accounts: web3.PublicKey[] = []

  const { instructions: sellToRepayIxns } = await sellToRepay({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(loan.collateral.mint),
    },
    args: {
      amountToSell: new BN(fraktBond.fbondTokenSupply.toString()),
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...sellToRepayIxns)

  const jupiterQuoteApi = createJupiterApiClient()

  const swapAmount = caclulateBorrowTokenLoanValue(loan).toNumber()

  const priceQuote = await jupiterQuoteApi.quoteGet({
    inputMint: SSOL_MINT.toBase58(),
    outputMint: WSOL_ADDRESS,
    amount: swapAmount,
    slippageBps,
    swapMode: 'ExactOut',
    ...DEFAULT_JUP_QUOTE_PARAMS,
    ...pair.customSellToRepayQuoteParams?.exactOut,
    onlyDirectRoutes: true,
  })

  if (expectedCollateralConversionRate) {
    const jupQuoteConversionRate = parseInt(priceQuote.inAmount) / parseInt(priceQuote.outAmount)
    const ratesDiff = jupQuoteConversionRate - expectedCollateralConversionRate
    const diffBps = (ratesDiff / expectedCollateralConversionRate) * BASE_POINTS

    if (diffBps > 0 && diffBps > slippageBps) {
      throw new Error('Unable to find a swap route with the entered slippage')
    }
  }

  const unstakedSolAresteaVaulBalance = await getUnstakedSolAresteaVaulBalance(
    walletAndConnection.connection,
  )

  const burnInstructions = getBurnLrtsInstructions({
    lrtsAmount: new BN(priceQuote.inAmount),
    walletPublicKey: walletAndConnection.wallet.publicKey,
    undelegateStake: unstakedSolAresteaVaulBalance.lt(new BN(priceQuote.inAmount)),
  })

  instructions.push(...burnInstructions)

  const { instructions: jupSwapInstructions, lookupTables: jupSwapLookupTables } =
    await getJupSwapIxns({
      jupiterQuoteApi,
      quote: priceQuote,
      walletPublicKey: walletAndConnection.wallet.publicKey,
    })

  instructions.push(...jupSwapInstructions)
  lookupTables.push(...jupSwapLookupTables)

  const { instructions: repayTokenLoanIxns, accounts: repayTokenLoanAccounts } =
    await createRepayTokenLoanTxnData({ loan }, walletAndConnection)

  instructions.push(...repayTokenLoanIxns)
  accounts.push(...(repayTokenLoanAccounts ?? []))

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseSellToRepayTokenLoanSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
