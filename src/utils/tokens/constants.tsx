import { BN } from 'fbonds-core'
import { LendingTokenType, OraclePriceFeedType } from 'fbonds-core/lib/fbond-protocol/types'

import { Pyth, Switchboard } from '@banx/icons'
import { ZERO_BN } from '@banx/utils'

//? Solana Rent Fees
export const SOLANA_RENT_FEE_BORROW_AMOUNT_IMPACT = {
  [LendingTokenType.NativeSol]: new BN(4621440), //? Solana rent fee (lamports)
  [LendingTokenType.BanxSol]: new BN(4621440),
  [LendingTokenType.Usdc]: ZERO_BN,
}

//? Token Units, Tickers
export enum TokenUnit {
  Usdc = '$',
  Sol = '◎',
}

export const TOKEN_UNIT = {
  [LendingTokenType.NativeSol]: TokenUnit.Sol,
  [LendingTokenType.BanxSol]: TokenUnit.Sol,
  [LendingTokenType.Usdc]: TokenUnit.Usdc,
}

export const TOKEN_TICKER: Record<LendingTokenType, string> = {
  [LendingTokenType.NativeSol]: 'SOL',
  [LendingTokenType.BanxSol]: 'SOL',
  [LendingTokenType.Usdc]: 'USDC',
}

export const TICKER_TO_TOKEN: Record<string, LendingTokenType> = {
  SOL: LendingTokenType.BanxSol,
  USDC: LendingTokenType.Usdc,
}

//? Token Decimals
export const TOKEN_DECIMALS = {
  [LendingTokenType.NativeSol]: 9,
  [LendingTokenType.BanxSol]: 9,
  [LendingTokenType.Usdc]: 6,
}

//? Formatting Rules
export const DECIMAL_PLACES_LIMITS = {
  [LendingTokenType.Usdc]: [
    { limit: 100, decimalPlaces: 0 }, //? Values up to 100 have 0 decimal places
    { limit: 0.1, decimalPlaces: 2 }, //? Values up to 0.1 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.1 have 3 decimal places
  ],
  [LendingTokenType.NativeSol]: [
    { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
    { limit: 0.1, decimalPlaces: 2 }, //? Values up to 0.1 have 2 decimal places
    { limit: 0.01, decimalPlaces: 3 }, //? Values up to 0.01 have 3 decimal places
    { limit: 0, decimalPlaces: 4 }, //? Values greater than 0 but less than 0.01 have 4 decimal places
  ],
  [LendingTokenType.BanxSol]: [
    { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
    { limit: 0.1, decimalPlaces: 2 }, //? Values up to 0.1 have 2 decimal places
    { limit: 0.01, decimalPlaces: 3 }, //? Values up to 0.01 have 3 decimal places
    { limit: 0, decimalPlaces: 4 }, //? Values greater than 0 but less than 0.01 have 4 decimal places
  ],
}

export const COLLATERAL_DECIMAL_PLACES_LIMITS = [
  { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
  { limit: 0.01, decimalPlaces: 2 }, //? Values up to 0.01 have 2 decimal places
  { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.01 have 3 decimal places
]

//? Minimum Values to Display
export const MIN_COLLATERAL_VALUE_TO_DISPLAY = 0.001
export const MIN_VALUE_TO_DISPLAY = {
  [LendingTokenType.NativeSol]: 0.001,
  [LendingTokenType.BanxSol]: 0.001,
  [LendingTokenType.Usdc]: 0.01,
}

//? Formatting Thresholds
export const COMMA_SEPARATION_THRESHOLD = 1000
export const DEFAULT_DECIMAL_PLACES = 2

//? Oracle
export const ORACLE_ICON_MAP = {
  [OraclePriceFeedType.Pyth]: <Pyth />,
  [OraclePriceFeedType.Switchboard]: <Switchboard />,
  [OraclePriceFeedType.None]: null,
}
