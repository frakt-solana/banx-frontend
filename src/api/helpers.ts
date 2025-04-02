import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { ZodType } from 'zod'

enum MarketType {
  SOL = 'sol',
  USDC = 'usdc',
  BANXSOL = 'banxSol',
}

const LENDING_TOKEN_TO_MARKET_MAP: Record<LendingTokenType, MarketType> = {
  [LendingTokenType.NativeSol]: MarketType.SOL,
  [LendingTokenType.BanxSol]: MarketType.BANXSOL,
  [LendingTokenType.Usdc]: MarketType.USDC,
}

export const convertToMarketType = (tokenType: LendingTokenType): MarketType => {
  return LENDING_TOKEN_TO_MARKET_MAP[tokenType]
}

export const parseResponseSafe = async <T>(
  data: unknown,
  schema: ZodType<unknown>,
): Promise<T | undefined> => {
  try {
    return (await schema.parseAsync(data)) as T
  } catch (validationError) {
    console.error('Schema validation error:', { validationError })
    return undefined
  }
}
