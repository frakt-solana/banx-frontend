import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { borrowPerpetualSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, BorrowOfferRaw, CollateralToken, FraktBond } from '@banx/api'
import { BONDS } from '@banx/constants'
import {
  accountConverterBNAndPublicKey,
  banxSol,
  parseAccountInfoByPubkey,
  sendTxnPlaceHolder,
} from '@banx/transactions'
import { adjustTokenAmountWithUpfrontFee } from '@banx/utils/core'
import { isBanxSolTokenType } from '@banx/utils/tokens'

export type CreateBorrowTokenTxnDataParams = {
  collateral: CollateralToken
  tokenType: LendingTokenType
  offer: BorrowOfferRaw
}

export type CreateBorrowTokenTxnData = (
  params: CreateBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTokenTxnDataParams>>

export const createBorrowSplTokenTxnData: CreateBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { collateral, tokenType, offer } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await borrowPerpetualSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      lender: new web3.PublicKey(offer.assetReceiver),
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      bondOffer: new web3.PublicKey(offer.publicKey),
      tokenMint: new web3.PublicKey(collateral.collateral.mint),
      hadoMarket: new web3.PublicKey(collateral.marketPubkey),
      fraktMarket: new web3.PublicKey(collateral.marketPubkey),
      oraclePriceFeed: collateral.collateral.oraclePriceFeed
        ? new web3.PublicKey(collateral.collateral.oraclePriceFeed)
        : undefined,
    },
    args: {
      amountToGet: new BN(offer.maxTokenToGet),
      amountToSend: new BN(offer.maxCollateralToReceive),
      optimizeIntoReserves: true,
      lendingTokenType: tokenType,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [
    accountsCollection['bondOffer'],
    accountsCollection['fraktBond'],
    accountsCollection['bondTradeTransaction'],
  ]

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    const marketUpfrontFee = new BN(collateral.collateral.upfrontFee)
    const adjustedLoanValue = adjustTokenAmountWithUpfrontFee(
      new BN(offer.maxTokenToGet),
      marketUpfrontFee,
    )

    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: adjustedLoanValue,
        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    instructions,
    signers,
    accounts,
    lookupTables,
  }
}

export const parseTokenBorrowSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const parsedAccountsBN = parseAccountInfoByPubkey(
    accountInfoByPubkey,
    accountConverterBNAndPublicKey,
  )
  const parsedAccounts = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: parsedAccountsBN?.['bondOfferV3']?.[0] as BondOfferV3,
    bondTradeTransaction: parsedAccounts?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: parsedAccounts?.['fraktBond']?.[0] as FraktBond,
  }
}
