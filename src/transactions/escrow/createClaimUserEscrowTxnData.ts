import { BN, web3 } from 'fbonds-core'
import {
  calculateBanxSolStakingRewards,
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
  claimPerpetualBondOfferStakingRewards,
  claimUserRentRewards,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { ClusterStats } from '@banx/api/common'
import { UserEscrow } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, isBanxSolTokenType } from '@banx/utils'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateClaimUserEscrowTxnDataParams = {
  userEscrow: UserEscrow
  clusterStats: ClusterStats
}

type CreateClaimUserEscrowTxnData = (
  params: CreateClaimUserEscrowTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimUserEscrowTxnDataParams>>

export const createClaimUserEscrowTxnData: CreateClaimUserEscrowTxnData = async (
  params,
  walletAndConnection,
) => {
  const { userEscrow, clusterStats } = params
  const { repaymentsAmount, interestRewardsAmount, rentRewards, lendingTokenType } = userEscrow

  const instructionsArray: web3.TransactionInstruction[] = []
  const signersArray: web3.Signer[] = []

  if (repaymentsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferRepayments({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (interestRewardsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferInterest({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (rentRewards.gt(ZERO_BN) && isBanxSolTokenType(userEscrow.lendingTokenType)) {
    const { instructions, signers } = await claimUserRentRewards({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  const totalLstYield = isBanxSolTokenType(lendingTokenType)
    ? calculateBanxSolStakingRewards({
        userVault: params.userEscrow,
        nowSlot: new BN(clusterStats.slot),
        currentEpochStartAt: new BN(clusterStats.epochStartedAt ?? 0),
      })
    : ZERO_BN

  if (isBanxSolTokenType(lendingTokenType) && totalLstYield.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferStakingRewards({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  const accounts = [userEscrow.publicKey]

  //? rentRewards is regular SOL. No need to swap
  const banxSolClaimAmount = isBanxSolTokenType(lendingTokenType)
    ? repaymentsAmount.add(interestRewardsAmount).add(totalLstYield)
    : ZERO_BN

  if (banxSolClaimAmount.gt(ZERO_BN)) {
    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: banxSolClaimAmount,
        instructions: instructionsArray,
        signers: signersArray,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions: instructionsArray,
    signers: signersArray,
    lookupTables: [],
  }
}

export const parseClaimUserEscrowSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['userVault']?.[0] as UserEscrow
}
