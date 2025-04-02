import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualListingSpl,
  getFullLoanBodyFromBorrowerSendedAmount,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond } from '@banx/api'
import { CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { ZERO_BN, getTokenDecimals } from '@banx/utils'

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
    collateralAmount,
    collateral,
    freezeValue = 0,
    offerLtvBP = 0,
    liquidationLtvBP = 0,
    tokenType,
  } = params

  const marketDecimals = getTokenDecimals(tokenType) //? 6,9
  const collateralDecimals = collateral.collateral.decimals

  const fullLoanAmount = getFullLoanBodyFromBorrowerSendedAmount({
    borrowerSendedAmount: borrowAmount,
    upfrontFeeBasePoints: collateral.collateral.upfrontFee,
  })

  const collateralsPerTokenFactor = Math.pow(10, collateralDecimals) * Math.pow(10, marketDecimals)
  const collateralsPerToken = (collateralAmount / fullLoanAmount) * collateralsPerTokenFactor

  const isOracleMarket = collateral.collateral.oraclePriceFeedType !== 'none'

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
      oraclePriceFeed:
        isOracleMarket && collateral.collateral.oraclePriceFeed
          ? new web3.PublicKey(collateral.collateral.oraclePriceFeed)
          : undefined,
    },
    args: {
      amountToGetBorrower: new BN(borrowAmount),
      collateralsPerToken: !isOracleMarket ? new BN(collateralsPerToken) : ZERO_BN,
      terminationFreeze: new BN(freezeValue),
      amountToSend: ZERO_BN,
      aprRate: new BN(aprRate),
      upfrontFeeBasePoints: collateral.collateral.upfrontFee,
      isBorrowerListing: true,
      lendingTokenType: tokenType,
      liquidationLtvBP: isOracleMarket ? new BN(liquidationLtvBP) : undefined,
      offerLtvBP: isOracleMarket ? new BN(offerLtvBP) : undefined,
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
