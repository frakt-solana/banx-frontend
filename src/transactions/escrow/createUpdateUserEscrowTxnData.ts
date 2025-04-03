import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { updateLiquidityToUserVault as updateLiquidityToUserEscrow } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { fetchTokenBalance } from '@banx/api/common'
import { UserEscrow } from '@banx/api/tokens'
import { BANX_SOL_ADDRESS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { isBanxSolTokenType } from '@banx/utils'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateUpdateUserEscrowTxnDataParams = {
  amount: BN
  lendingTokenType: LendingTokenType
  add: boolean
}

type CreateUpdateUserEscrowTxnData = (
  params: CreateUpdateUserEscrowTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUpdateUserEscrowTxnDataParams>>

export const createUpdateUserEscrowTxnData: CreateUpdateUserEscrowTxnData = async (
  params,
  walletAndConnection,
) => {
  const { amount, lendingTokenType, add } = params
  const { connection, wallet } = walletAndConnection

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await updateLiquidityToUserEscrow({
    connection,
    args: {
      amount,
      lendingTokenType,
      add,
    },
    accounts: {
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['lenderVault']]
  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(lendingTokenType) && add) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const diff = amount.sub(banxSolBalance)

    return await banxSol.combineWithBuyBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: diff.abs(),
        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  if (isBanxSolTokenType(lendingTokenType) && !add) {
    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: amount,
        instructions,
        signers,
        lookupTables,
      },
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

export const parseUpdateUserEscrowSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)
  return results?.['userVault']?.[0] as UserEscrow
}
