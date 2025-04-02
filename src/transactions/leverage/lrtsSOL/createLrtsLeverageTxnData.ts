import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMintLrtsInstructions } from 'fbonds-core/lib/fbond-protocol/functions/multiply'
import {
  borrowPerpetualSpl,
  getFullLoanBodyFromBorrowerSendedAmount,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/transactions'

import { CreateLeverageTxnData } from '../common'
import { getFlashLoanIxns } from '../flashLoan'

export const createLrtsLeverageTxnData: CreateLeverageTxnData = async (
  params,
  walletAndConnection,
) => {
  const {
    offer,
    collateralConversionRate,
    totalCollateralAmount,
    multiplier,
    userEnteredCollateralAmount,
    collateralTokenMeta,
    pair,
  } = params
  const flashLoanCollateralAmount = totalCollateralAmount
    .sub(userEnteredCollateralAmount)
    .add(new BN(1))

  const flashLoanSolAmount = flashLoanCollateralAmount
    .mul(new BN(1e9))
    .div(new BN(collateralConversionRate * 1e9))

  const { flashBorrowIxns, flashRepayIxns } = await getFlashLoanIxns({
    amount: flashLoanSolAmount,
    tokenType: pair.marketTokenType,
    walletAndConnection,
  })

  const amountToGetFromBorrowing = getFullLoanBodyFromBorrowerSendedAmount({
    borrowerSendedAmount: flashLoanSolAmount.toNumber(),
    upfrontFeeBasePoints: collateralTokenMeta.upfrontFee,
  })

  const { instructions: borrowIxns, accounts: borrowAccounts } = await borrowPerpetualSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      lender: offer.lender,
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      bondOffer: offer.publicKey,
      tokenMint: new web3.PublicKey(collateralTokenMeta.mint),
      hadoMarket: new web3.PublicKey(pair.marketPublicKey),
      fraktMarket: new web3.PublicKey(pair.marketPublicKey),
      oraclePriceFeed: collateralTokenMeta.oraclePriceFeed
        ? new web3.PublicKey(collateralTokenMeta.oraclePriceFeed)
        : undefined,
    },
    args: {
      amountToGet: new BN(amountToGetFromBorrowing),
      amountToSend: totalCollateralAmount,
      optimizeIntoReserves: true,
      lendingTokenType: pair.marketTokenType,
      leverageBasePoints: new BN(Math.floor(multiplier * 100 * BASE_POINTS)),
    },

    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const mintLrtsIxns = getMintLrtsInstructions({
    conversionRate: collateralConversionRate,
    solAmount: new BN(flashLoanSolAmount),
    walletPublicKey: walletAndConnection.wallet.publicKey,
  })

  return {
    params,
    accounts: Object.values(borrowAccounts),
    instructions: [...flashBorrowIxns, ...mintLrtsIxns, ...borrowIxns, ...flashRepayIxns],
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
