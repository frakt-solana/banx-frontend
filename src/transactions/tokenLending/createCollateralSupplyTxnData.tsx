import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { addLoanCollateral } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond } from '@banx/api'
import { TokenLoan } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/transactions/helpers'

import { parseAccountInfoByPubkey } from '../functions'

export type CreateCollateralSupplyTxnDataParams = {
  loan: TokenLoan
  collateralAmount: BN
}

type CreateCollateralSupplyTxnData = (
  params: CreateCollateralSupplyTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateCollateralSupplyTxnDataParams>>

export const createCollateralSupplyTxnData: CreateCollateralSupplyTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, collateralAmount } = params
  const { bondTradeTransaction, collateral, fraktBond } = loan

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await addLoanCollateral({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      collateralTokenMint: new web3.PublicKey(collateral.mint),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondTradeTransactoin: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
    },
    args: {
      amount: collateralAmount,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['bondTradeTransaction'], accountsCollection['fraktBond']]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseCollateralSupplySimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
