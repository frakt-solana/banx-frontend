import { Instruction, QuoteResponse, DefaultApi, createJupiterApiClient } from '@jup-ag/api'
import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowPerpetualSpl,
  getFullLoanBodyFromBorrowerSendedAmount,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { offer as tokenOfferUtils } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api'
import { DEFAULT_JUP_QUOTE_PARAMS } from '@banx/api/common'
import { MultiplyPair } from '@banx/app/multiply/[ticker]/types'
import { BONDS, USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/transactions'
import { deserializeJupInstruction } from '@banx/transactions/jup'
import { bnToNumberSafe } from '@banx/utils/bn'
import { getTokenDecimals } from '@banx/utils/tokens'

import { getFlashLoanIxns } from '../flashLoan'

export type CreateLeverageParams = {
  offer: tokenOfferUtils.SimpleOffer
  multiplier: number
  collateralConversionRate: number
  userEnteredCollateralAmount: BN
  totalCollateralAmount: BN
  collateralTokenMeta: core.TokenMeta
  pair: MultiplyPair
  slippageBps: number
  swapWarningHandler?: (message: string) => void
}

export type CreateLeverageTxnData = (
  params: CreateLeverageParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLeverageParams>>

//TODO IMPORTANT: Add meteora routes support (move accounts into lookup table)
export const createLeverageTxnData: CreateLeverageTxnData = async (params, walletAndConnection) => {
  const {
    offer,
    totalCollateralAmount,
    collateralConversionRate,
    multiplier,
    userEnteredCollateralAmount,
    collateralTokenMeta,
    pair,
    slippageBps,
    swapWarningHandler,
  } = params

  const lendingTokenMint =
    pair.marketTokenType === LendingTokenType.Usdc ? USDC_ADDRESS : WSOL_ADDRESS

  const flashLoanCollateralAmount = totalCollateralAmount.sub(userEnteredCollateralAmount)

  const jupiterQuoteApi = createJupiterApiClient()

  let quote: QuoteResponse | null = null

  try {
    const exactOutQuote = await jupiterQuoteApi.quoteGet({
      inputMint: lendingTokenMint,
      outputMint: pair.collateralMint.toBase58(),
      amount: bnToNumberSafe(flashLoanCollateralAmount),
      slippageBps,
      swapMode: 'ExactOut',
      onlyDirectRoutes: true,
      ...DEFAULT_JUP_QUOTE_PARAMS,
      ...pair.customLeverageQuoteParams?.exactOut,
    })

    quote = exactOutQuote
  } catch {
    swapWarningHandler?.('Exact swap not found. Trying to find the closest...')

    const marketTokenDecimals = getTokenDecimals(pair.marketTokenType)
    const decimalsDiff = marketTokenDecimals - collateralTokenMeta.decimals

    const amountOnIn = Math.round(
      (bnToNumberSafe(flashLoanCollateralAmount) / collateralConversionRate) * 10 ** decimalsDiff,
    )

    const exactInQuote = await jupiterQuoteApi.quoteGet({
      inputMint: lendingTokenMint,
      outputMint: pair.collateralMint.toBase58(),
      amount: amountOnIn,
      slippageBps,
      swapMode: 'ExactIn',
      onlyDirectRoutes: true,
      ...DEFAULT_JUP_QUOTE_PARAMS,
      ...pair.customLeverageQuoteParams?.exactIn,
    })

    if (new BN(exactInQuote.outAmount).lt(flashLoanCollateralAmount)) {
      throw new Error('Unable to find swap route')
    }

    quote = exactInQuote
  }

  const flashLoanLendingTokenAmount = new BN(quote.inAmount)

  const {
    flashBorrowIxns,
    flashRepayIxns,
    feePercent: flashLoanFeePercent,
  } = await getFlashLoanIxns({
    amount: flashLoanLendingTokenAmount,
    tokenType: pair.marketTokenType,
    walletAndConnection,
  })

  const { instructions: jupSwapInstructions, lookupTables: jupSwapLookupTables } =
    await getJupSwapIxns({
      jupiterQuoteApi,
      quote,
      walletPublicKey: walletAndConnection.wallet.publicKey,
    })

  const amountToGetFromBorrowing =
    getFullLoanBodyFromBorrowerSendedAmount({
      borrowerSendedAmount: bnToNumberSafe(flashLoanLendingTokenAmount),
      upfrontFeeBasePoints: collateralTokenMeta.upfrontFee,
    }) *
    (1 + flashLoanFeePercent / 100)

  const { instructions: borrowIxns, accounts: borrowAccounts } = await borrowPerpetualSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      lender: offer.lender,
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      bondOffer: offer.publicKey,
      tokenMint: new web3.PublicKey(collateralTokenMeta.mint),
      hadoMarket: new web3.PublicKey(pair.marketPublicKey),
      fraktMarket: new web3.PublicKey(pair.marketPublicKey),
      oraclePriceFeed: collateralTokenMeta.oraclePriceFeed
        ? new web3.PublicKey(collateralTokenMeta.oraclePriceFeed)
        : undefined,
    },
    args: {
      amountToGet: new BN(amountToGetFromBorrowing),
      amountToSend: totalCollateralAmount,
      optimizeIntoReserves: true,
      lendingTokenType: pair.marketTokenType,
      leverageBasePoints: new BN(Math.floor(multiplier * 100 * BASE_POINTS)),
    },

    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    params,
    accounts: Object.values(borrowAccounts),
    instructions: [...flashBorrowIxns, ...jupSwapInstructions, ...borrowIxns, ...flashRepayIxns],
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE), ...jupSwapLookupTables],
  }
}

const getJupSwapIxns = async (params: {
  jupiterQuoteApi: DefaultApi
  quote: QuoteResponse
  walletPublicKey: web3.PublicKey
}) => {
  const { jupiterQuoteApi, quote, walletPublicKey } = params

  const {
    setupInstructions: setupPayload,
    swapInstruction: swapInstructionPayload,
    cleanupInstruction: cleanupPayload,
    addressLookupTableAddresses: jupLookupTableAddresses,
  } = await jupiterQuoteApi.swapInstructionsPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: walletPublicKey.toBase58(),
    },
  })

  const jupIxns: Instruction[] = []

  if (setupPayload.length) {
    jupIxns.push(...setupPayload)
  }
  if (swapInstructionPayload) {
    jupIxns.push(swapInstructionPayload)
  }
  if (cleanupPayload) {
    jupIxns.push(cleanupPayload)
  }

  const jupLookupTableAddressesPk = jupLookupTableAddresses.map(
    (lookupTableAddress: string) => new web3.PublicKey(lookupTableAddress),
  )

  const swapInstructions = jupIxns.map(deserializeJupInstruction)

  return {
    lookupTables: jupLookupTableAddressesPk,
    instructions: swapInstructions,
  }
}
