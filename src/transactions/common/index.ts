import { web3 } from 'fbonds-core'
import { createAssociatedTokenAccountInstructionIdimpotent } from 'fbonds-core/lib/common'

import { findAssociatedTokenAddress } from '../helpers'

export const createATAIdimpotentInstruction = (
  walletPublicKey: web3.PublicKey,
  tokenMint: web3.PublicKey,
): web3.TransactionInstruction => {
  const ATA = findAssociatedTokenAddress(walletPublicKey, tokenMint)

  return createAssociatedTokenAccountInstructionIdimpotent(
    ATA,
    walletPublicKey,
    walletPublicKey,
    tokenMint,
  )[0]
}
