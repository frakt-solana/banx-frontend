import { harvestRewards } from 'banx-vaults-sdk/lib/banx-vaults/functions/banxVaultsUser'
import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  getTokenMintFromLendingTokenType,
  updateLiquidityToUserVault as updateLiquidityToUserEscrow,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { UserEscrow } from '@banx/api'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateClaimRewardsFromPoolTxnDataParams = {
  amount: BN
  vaultPubkey: string
  lendingToken: LendingTokenType
}

type CreateClaimRewardsFromPoolTxnData = (
  params: CreateClaimRewardsFromPoolTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimRewardsFromPoolTxnDataParams>>

export const createClaimRewardsFromPoolTxnData: CreateClaimRewardsFromPoolTxnData = async (
  params,
  walletAndConnection,
) => {
  const { connection, wallet } = walletAndConnection
  const { amount, vaultPubkey, lendingToken } = params

  const { instructions: harvestRewardsInstructions, signers: harvestRewardsSigners } =
    await harvestRewards({
      accounts: {
        lendingToken: getTokenMintFromLendingTokenType(lendingToken),
        banxPool: new web3.PublicKey(vaultPubkey),
        userPubkey: wallet.publicKey,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

  const {
    instructions: updateUserEscrowInstructions,
    signers: updateUserEscrowSigners,
    accounts: updateUserEscrowAccounts,
  } = await updateLiquidityToUserEscrow({
    connection,
    args: {
      amount: amount,
      lendingTokenType: lendingToken,
      add: true,
    },
    accounts: {
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructions = [...harvestRewardsInstructions, ...updateUserEscrowInstructions]
  const signers = [...harvestRewardsSigners, ...updateUserEscrowSigners]

  return {
    params,
    accounts: [updateUserEscrowAccounts['lenderVault']],
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseClaimRewardsFromPoolSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['userVault']?.[0] as UserEscrow
}
