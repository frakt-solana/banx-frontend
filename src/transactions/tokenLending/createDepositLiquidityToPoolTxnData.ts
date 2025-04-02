import { depositLiquidityToPool } from 'banx-vaults-sdk/lib/banx-vaults/functions/banxVaultsUser'
import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  getTokenMintFromLendingTokenType,
  updateLiquidityToUserVault,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType, UserVault } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { ZERO_BN, isBanxSolTokenType } from '@banx/utils'

import { banxSol } from '..'
import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateDepositLiquidityToPoolTxnDataParams = {
  amount: BN
  vaultPubkey: string
  lendingToken: LendingTokenType
  userVault: UserVault | undefined
}

type CreateDepositLiquidityToPoolTxnData = (
  params: CreateDepositLiquidityToPoolTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateDepositLiquidityToPoolTxnDataParams>>

export const createDepositLiquidityToPoolTxnData: CreateDepositLiquidityToPoolTxnData = async (
  params,
  walletAndConnection,
) => {
  const { connection, wallet } = walletAndConnection

  const { amount, vaultPubkey, lendingToken, userVault } = params

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []
  const accounts: web3.PublicKey[] = []

  const userVaultBalance = userVault?.offerLiquidityAmount || ZERO_BN
  const fundsFromVault = BN.min(amount, userVaultBalance)
  const fundsFromWallet = amount.sub(fundsFromVault)

  if (!userVaultBalance.isZero()) {
    const {
      instructions: updateUserVaultInstructions,
      signers: updateUserVaultSigners,
      accounts: updateUseVaultAccounts,
    } = await updateLiquidityToUserVault({
      connection: walletAndConnection.connection,
      args: {
        amount: fundsFromVault,
        lendingTokenType: lendingToken,
        add: false,
      },
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateUserVaultInstructions)
    signers.push(...updateUserVaultSigners)
    accounts.push(updateUseVaultAccounts.lenderVault)
  }

  if (isBanxSolTokenType(lendingToken) && !fundsFromWallet.isZero()) {
    const { instructions: swapInstructions } = await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: fundsFromWallet,
      walletAndConnection,
    })

    instructions.push(...swapInstructions)
  }

  const { instructions: depositLiquidityInstructions, signers: depositLiquiditySigners } =
    await depositLiquidityToPool({
      accounts: {
        lendingToken: getTokenMintFromLendingTokenType(lendingToken),
        banxPool: new web3.PublicKey(vaultPubkey),
        userPubkey: wallet.publicKey,
      },
      args: {
        amountToDeposit: amount,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

  instructions.push(...depositLiquidityInstructions)
  signers.push(...depositLiquiditySigners)

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseDepositLiquidityToPoolSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['userVault']?.[0] as UserVault
}
