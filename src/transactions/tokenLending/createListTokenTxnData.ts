import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { createPerpetualListingSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, CollateralToken, FraktBond } from '@banx/api'
import { BONDS } from '@banx/constants'
import { ZERO_BN } from '@banx/utils/bn'

import { parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateListTokenTxnDataParams = {
  collateral: CollateralToken

  borrowAmount: number
  collateralAmount: number //? normal number f.e 200, 300
  aprRate: number
  freezeValue: number

  offerLtvBP?: number //? LTV basis points for oracle markets
  liquidationLtvBP?: number //? Liquidation LTV basis points for oracle markets

  tokenType: LendingTokenType
}

type CreateListTxnData = (
  params: CreateListTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateListTokenTxnDataParams>>

export const createListTokenTxnData: CreateListTxnData = async (params, walletAndConnection) => {
  const { connection, wallet } = walletAndConnection

  const {
    aprRate,
    borrowAmount,
    collateral,
    freezeValue = 0,
    offerLtvBP = 0,
    liquidationLtvBP = 0,
    tokenType,
  } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await createPerpetualListingSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      hadoMarket: new web3.PublicKey(collateral.marketPubkey),
      userPubkey: wallet.publicKey,
      collateralMint: new web3.PublicKey(collateral.collateral.mint),
      oraclePriceFeed: collateral.collateral.oraclePriceFeed
        ? new web3.PublicKey(collateral.collateral.oraclePriceFeed)
        : undefined,
    },
    args: {
      amountToGetBorrower: new BN(borrowAmount),
      collateralsPerToken: ZERO_BN,
      terminationFreeze: new BN(freezeValue),
      amountToSend: ZERO_BN,
      aprRate: new BN(aprRate),
      upfrontFeeBasePoints: collateral.collateral.upfrontFee,
      isBorrowerListing: true,
      lendingTokenType: tokenType,
      liquidationLtvBP: new BN(liquidationLtvBP),
      offerLtvBP: new BN(offerLtvBP),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseListTokenSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
