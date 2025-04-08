import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
  updateLiquidityToUserVault,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { Offer } from '@banx/api'
import { fetchTokenBalance } from '@banx/api/common'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN } from '@banx/utils/bn'
import { calculateNewOfferSize } from '@banx/utils/core'
import { isBanxSolTokenType } from '@banx/utils/tokens'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateMakeBondingOfferTxnDataParams = {
  marketPubkey: string
  bondFeature: BondFeatures

  loanValue: number //? Total value of the offer
  loansAmount: number //? Number of loans being processed
  collateralsPerToken?: BN //? Collateral amount per token (applicable for non-oracle markets)

  offerLtvBP?: BN //? LTV basis points for oracle markets
  liquidationLtvBP?: BN //? Liquidation LTV basis points for oracle markets

  escrowBalance: BN | undefined //? Current balance of the escrow
  depositAmountToVault?: BN //? Amount to deposit into the vault

  tokenType: LendingTokenType
  tokenLendingApr?: number
}

type CreateMakeBondingOfferTxnData = (
  params: CreateMakeBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateMakeBondingOfferTxnDataParams>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const {
    marketPubkey,
    bondFeature,
    loanValue,
    loansAmount,
    collateralsPerToken = ZERO_BN,
    offerLtvBP = ZERO_BN,
    liquidationLtvBP = ZERO_BN,
    tokenLendingApr = 0,
    escrowBalance = ZERO_BN,
    depositAmountToVault = ZERO_BN,
    tokenType,
  } = params

  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  if (!depositAmountToVault.isZero()) {
    const updateVaultIxns = await updateLiquidityToUserVault({
      connection: walletAndConnection.connection,
      args: {
        amount: depositAmountToVault,
        lendingTokenType: tokenType,
        add: true,
      },
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateVaultIxns.instructions)
    signers.push(...updateVaultIxns.signers)
  }

  const createOfferIxns = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: new BN(loanValue),
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature,
      collateralsPerToken,
      tokenLendingApr: new BN(tokenLendingApr),
      offerLtvBP,
      liquidationLtvBP,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...createOfferIxns.instructions)
  signers.push(...createOfferIxns.signers)

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]
  const accounts = [createOfferIxns.accounts['bondOffer']]

  if (isBanxSolTokenType(tokenType) && !depositAmountToVault.isZero()) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const offerSize = calculateNewOfferSize({ loanValue, loansAmount })
    const diff = offerSize.sub(banxSolBalance).sub(escrowBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff,
          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseMakeOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3']?.[0] as Offer
}

export const parseMakeTokenOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['bondOfferV3']?.[0] as BondOfferV3
}
