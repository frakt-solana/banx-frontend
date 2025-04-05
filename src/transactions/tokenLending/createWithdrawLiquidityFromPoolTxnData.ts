import {
  requestWithdrawFromPool,
  withdrawLiquidityFromPool,
} from 'banx-vaults-sdk/lib/banx-vaults/functions/banxVaultsUser'
import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  getTokenMintFromLendingTokenType,
  updateLiquidityToUserVault as updateLiquidityToUserEscrow,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { UserEscrow, VaultPreview } from '@banx/api'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateWithdrawLiquidityFromPoolTxnDataParams = {
  amount: BN
  vault: VaultPreview
}

type CreateWithdrawLiquidityFromPoolTxnData = (
  params: CreateWithdrawLiquidityFromPoolTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateWithdrawLiquidityFromPoolTxnDataParams>>

export const createWithdrawLiquidityFromPoolTxnData: CreateWithdrawLiquidityFromPoolTxnData =
  async (params, walletAndConnection) => {
    const { connection, wallet } = walletAndConnection

    const { amount, vault } = params

    const instructions: web3.TransactionInstruction[] = []
    const signers: web3.Signer[] = []
    const accounts: web3.PublicKey[] = []

    const handleWithdrawLiquidity = async (amount: BN) => {
      const { instructions: liquidityInstructions, signers: liquiditySigners } =
        await withdrawLiquidityFromPool({
          accounts: {
            banxPool: new web3.PublicKey(vault.vaultPubkey),
            userPubkey: wallet.publicKey,
            lendingToken: getTokenMintFromLendingTokenType(vault.lendingToken),
          },
          args: {
            amountToWithdraw: amount,
          },
          connection,
          sendTxn: sendTxnPlaceHolder,
        })

      instructions.push(...liquidityInstructions)
      signers.push(...liquiditySigners)

      const {
        instructions: updateUserEscrowInstructions,
        signers: updateUserEscrowSigners,
        accounts: updateUserEscrowAccounts,
      } = await updateLiquidityToUserEscrow({
        connection,
        args: {
          amount: amount,
          lendingTokenType: vault.lendingToken,
          add: true,
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

    const handleRequestWithdraw = async (amount: BN) => {
      const { instructions: requestInstructions, signers: requestSigners } =
        await requestWithdrawFromPool({
          accounts: {
            banxPool: new web3.PublicKey(vault.vaultPubkey),
            userPubkey: wallet.publicKey,
          },
          args: {
            amountToWithdraw: amount,
          },
          connection,
          sendTxn: sendTxnPlaceHolder,
        })

      instructions.push(...requestInstructions)
      signers.push(...requestSigners)
    }

    if (amount.lte(new BN(vault.reserves))) {
      await handleWithdrawLiquidity(amount)
    } else {
      const availableAmount = new BN(vault.reserves)
      const remainingAmount = new BN(vault.requestedWithdrawAmount).add(amount.sub(availableAmount))

      await handleWithdrawLiquidity(availableAmount)
      await handleRequestWithdraw(remainingAmount)
    }

    return {
      params,
      accounts,
      instructions,
      signers,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

export const parseWithdrawLiquidityFromPoolSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['userVault']?.[0] as UserEscrow
}
