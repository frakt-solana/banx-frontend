import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { terminatePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond, Loan, Offer } from '@banx/api'
import { BONDS } from '@banx/constants'

import { parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

/**
 * @property {boolean} [startLiquidation] - Determines the liquidation behavior after termination.
 * - @true The loan will be liquidated upon termination.
 * - @false The termination will continue indefinitely without liquidation.
 */

export type CreateTerminateTokenTxnDataParams = {
  loan: Loan
  startLiquidation?: boolean
}

type CreateTerminateTokenTxnData = (
  params: CreateTerminateTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateTerminateTokenTxnDataParams>>

export const createTerminateTokenTxnData: CreateTerminateTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, startLiquidation = true } = params

  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, accounts } = await terminatePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      startLiquidation,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    params,
    accounts: [accounts['bondOffer'], accounts['bondTradeTransaction'], accounts['fraktBond']],
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseTerminateSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: results?.['bondOfferV3']?.[0] as Offer,
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
