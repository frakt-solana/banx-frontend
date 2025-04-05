import BN from 'bn.js'
import { web3 } from 'fbonds-core'
import { z } from 'zod'

/**
 * Transforms a string → BN instance (use only `bn.js`)
 */
export const zStringToBN = z.string().transform((val) => new BN(val))

/**
 * Transforms a number → BN
 */
export const zNumberToBN = z.number().transform((val) => new BN(val.toString()))

/**
 * Transforms a string → Solana PublicKey
 */
export const zStringToPubkey = z.string().transform((val) => new web3.PublicKey(val))

/**
 * Transforms a string → integer
 */
export const zStringToInt = z.string().transform((val) => parseInt(val))

/**
 * Transforms a string → float
 */
export const zStringToFloat = z.string().transform((val) => parseFloat(val))

/**
 * Leaves public key string as-is
 */
export const zPubkeyString = z.string()
