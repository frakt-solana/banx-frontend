import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { web3 } from 'fbonds-core'

export const findAssociatedTokenAddress = (
  walletAddress: web3.PublicKey,
  tokenMintAddress: web3.PublicKey,
): web3.PublicKey => {
  return web3.PublicKey.findProgramAddressSync(
    [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0]
}
