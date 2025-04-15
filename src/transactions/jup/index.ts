import { Instruction, QuoteResponse, DefaultApi } from '@jup-ag/api'
import { web3 } from 'fbonds-core'

export const deserializeJupInstruction = (instruction: Instruction) => {
  return new web3.TransactionInstruction({
    programId: new web3.PublicKey(instruction.programId),
    keys: instruction.accounts.map((key) => ({
      pubkey: new web3.PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, 'base64'),
  })
}

export const getJupSwapIxns = async (params: {
  jupiterQuoteApi: DefaultApi
  quote: QuoteResponse
  walletPublicKey: web3.PublicKey
}) => {
  const { jupiterQuoteApi, quote, walletPublicKey } = params

  const {
    setupInstructions: setupPayload,
    swapInstruction: swapInstructionPayload,
    cleanupInstruction: cleanupPayload,
    addressLookupTableAddresses: jupLookupTableAddresses,
  } = await jupiterQuoteApi.swapInstructionsPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: walletPublicKey.toBase58(),
    },
  })

  const jupIxns: Instruction[] = []

  if (setupPayload.length) {
    jupIxns.push(...setupPayload)
  }
  if (swapInstructionPayload) {
    jupIxns.push(swapInstructionPayload)
  }
  if (cleanupPayload) {
    jupIxns.push(cleanupPayload)
  }

  const jupLookupTableAddressesPk = jupLookupTableAddresses.map(
    (lookupTableAddress: string) => new web3.PublicKey(lookupTableAddress),
  )

  const swapInstructions = jupIxns.map(deserializeJupInstruction)

  return {
    lookupTables: jupLookupTableAddressesPk,
    instructions: swapInstructions,
  }
}
