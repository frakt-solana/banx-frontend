import { BN, web3 } from 'fbonds-core'
import { BondTradeTransactionV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { BondTradeTransaction } from './types'

export const convertBondTradeTransactionToCore = (
  schema: BondTradeTransaction,
): BondTradeTransactionV3 => {
  return {
    ...schema,
    publicKey: new web3.PublicKey(schema.publicKey),
    amountOfBonds: new BN(schema.amountOfBonds),
    bondOffer: new web3.PublicKey(schema.bondOffer),
    borrowerFullRepaidAmount: new BN(schema.borrowerFullRepaidAmount),
    borrowerOriginalLent: new BN(schema.borrowerOriginalLent),
    currentRemainingLent: new BN(schema.currentRemainingLent),
    fbondTokenMint: new web3.PublicKey(schema.fbondTokenMint),
    feeAmount: new BN(schema.feeAmount),
    interestSnapshot: new BN(schema.interestSnapshot),
    lenderFullRepaidAmount: new BN(schema.lenderFullRepaidAmount),
    lenderOriginalLent: new BN(schema.lenderOriginalLent),
    partialRepaySnapshot: new BN(schema.partialRepaySnapshot),
    redeemedAt: new BN(schema.redeemedAt),
    repaymentCallAmount: new BN(schema.repaymentCallAmount),
    seller: new web3.PublicKey(schema.seller),
    solAmount: new BN(schema.solAmount),
    soldAt: new BN(schema.soldAt),
    terminationFreeze: new BN(schema.terminationFreeze),
    terminationStartedAt: new BN(schema.terminationStartedAt),
    user: new web3.PublicKey(schema.user),
    redeemResultNext: schema.redeemResultNext,
    protocolInterestFee: new BN(schema.protocolInterestFee),
    collateralAmountSnapshot: new BN(schema.collateralAmountSnapshot.toString()),
  }
}
