import { BN, web3 } from 'fbonds-core'
import { z } from 'zod'

/**
 * BN from string
 */
export const SerializedBNSchema = z.string().transform((val): BN => new BN(val))

/**
 * PublicKey from string
 */
export const SerializedPublicKeySchema = z.string().transform((val) => new web3.PublicKey(val))

/**
 * Number from string
 */
export const StringIntSchema = z.string().transform((val) => parseInt(val))

export const StringToNumberSchema = z.string().transform((val) => parseFloat(val))

export const SerializedIntBNSchema: BN = z.number().transform((value) => {
  return new BN(value.toString())
})

export const StringPublicKeySchema = z.string()
