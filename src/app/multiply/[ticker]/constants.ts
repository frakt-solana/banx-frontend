import { BN, web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { OnboardingModalContentType } from '@banx/components/modals'

import { IS_SDK_ON_DEV_CONTRACT } from '@banx/constants'
import { leverage, lrtsSOL } from '@banx/transactions/leverage'
import { getTokenDecimals } from '@banx/utils'

import { CustomQuoteParamsConfig, MultiplyPair } from './types'

export const MIN_MULTIPLIER_VALUE = 2 //? Minimum allowed leverage factor (expressed as an “X” multiplier, e.g., 2 = 2x)

export const JLP_PAIR: MultiplyPair = {
  collateralTicker: 'JLP',
  collateralLogoUrl: 'https://static.jup.ag/jlp/icon.png',
  collateralMint: new web3.PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4'),
  marketTokenType: LendingTokenType.Usdc,
  marketPublicKey: !IS_SDK_ON_DEV_CONTRACT
    ? new web3.PublicKey('ECxo4ZF9zyTGVXq42wwnKboX4hFNmAyhyqnyCgxVAm4S')
    : new web3.PublicKey('GHMX8me6S4RGi5fs3VRpTS7VSrA5AdtwrqfM3uhKYnpr'),
  loanValueLimit: undefined,
  minPositionSize: new BN(1e6), //? 1 JLP
  createLeverageTxnHandler: leverage.createLeverageTxnData,
  createSellToRepayTxnHandler: leverage.createSellToRepayTokenLoanTxnData,
  onboardingContent: OnboardingModalContentType.MULTIPLY_JLP,
}

export const LRTS_PAIR: MultiplyPair = {
  collateralTicker: 'lrtsSOL',
  collateralLogoUrl:
    'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fi.degencdn.com%2Fipfs%2Fbafkreigoloautosntlteqccwusdjpxvtm3nm3kqvkavwxwickrk5irfety',
  collateralMint: lrtsSOL.LRTS_MINT,
  getNonJupLeverageConversionRate: lrtsSOL.getSolayerConversionRate,

  marketTokenType: LendingTokenType.BanxSol,
  marketPublicKey: !IS_SDK_ON_DEV_CONTRACT
    ? new web3.PublicKey('7EuPa26AjGdnQ7JcqM3kFhwFR4U2NQTU9guHcmaDF2G')
    : new web3.PublicKey('EJXya3FW1T8uZnxjtph7PxTeQJkb44eqYJwJHhTJhms3'),
  loanValueLimit: new BN(120 * 10 ** getTokenDecimals(LendingTokenType.BanxSol)),
  minPositionSize: new BN(1e8), //? 0.1 lrtsSOL
  createLeverageTxnHandler: lrtsSOL.createLrtsLeverageTxnData,
  createSellToRepayTxnHandler: lrtsSOL.createLrtsSellToRepayTokenLoanTxnData,
  onboardingContent: OnboardingModalContentType.MULTIPLY_LRTS,
}

export const ADRASOL_PAIR: MultiplyPair = {
  collateralTicker: 'adraSOL',
  collateralLogoUrl: 'https://app.adrastea.fi/adraSOL.png',
  collateralMint: new web3.PublicKey('sctmY8fJucsJatwHz6P48RuWBBkdBMNmSMuBYrWFdrw'),
  marketTokenType: LendingTokenType.BanxSol,
  marketPublicKey: new web3.PublicKey('Ed6XWrty4F8Fyn8fvRuk4Am6gZuEjDCL4Botj28UHZVN'), //? Works only on production contract
  loanValueLimit: undefined,
  minPositionSize: new BN(1e8), //? 0.1 adraSOL
  createLeverageTxnHandler: leverage.createLeverageTxnData,
  createSellToRepayTxnHandler: leverage.createSellToRepayTokenLoanTxnData,
  onboardingContent: OnboardingModalContentType.MULTIPLY_ADRASOL,
}

export const VSOL_PAIR: MultiplyPair = {
  collateralTicker: 'vSOL',
  collateralLogoUrl: 'https://gateway.irys.xyz/DTBps6awrJWectiBhMubYke4TBnE9kkVqyCVP4MB4irB',
  collateralMint: new web3.PublicKey('vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7'),
  marketTokenType: LendingTokenType.BanxSol,
  marketPublicKey: new web3.PublicKey('HqpFfK9Dz6p9Pyt5Ncg8PvGNcw1sKNhQZFqfm5B32Z82'), //? Works only on production contract
  loanValueLimit: undefined,
  minPositionSize: new BN(1e8), //? 0.1 vSOL
  createLeverageTxnHandler: leverage.createLeverageTxnData,
  createSellToRepayTxnHandler: leverage.createSellToRepayTokenLoanTxnData,
  onboardingContent: OnboardingModalContentType.MULTIPLY_VSOL,

  customLeverageQuoteParams: {
    exactIn: {
      onlyDirectRoutes: true,
      dexes: ['Sanctum'],
      maxAccounts: 24,
    },
    exactOut: {
      onlyDirectRoutes: true,
      dexes: ['Sanctum'],
    },
  },
  customSellToRepayQuoteParams: {
    exactIn: {
      onlyDirectRoutes: true,
      dexes: ['Sanctum'],
      maxAccounts: 24,
    },
    exactOut: {
      onlyDirectRoutes: true,
      dexes: ['Sanctum'],
    },
  },
}

export const WFRAGSOL_PAIR: MultiplyPair = {
  collateralTicker: 'wfragSOL',
  collateralLogoUrl: 'https://fragmetric-assets.s3.ap-northeast-2.amazonaws.com/wfragsol.png',
  collateralMint: new web3.PublicKey('WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U'),

  marketTokenType: LendingTokenType.BanxSol,
  marketPublicKey: new web3.PublicKey('5c8BxBTHVWhVygh3gLioeQVJH6D4DcxEm167X74p8cNu'), //? Works only on production contract
  loanValueLimit: undefined,
  minPositionSize: new BN(1e8), //? 0.1 wfragSOL
  createLeverageTxnHandler: leverage.createLeverageTxnData,
  createSellToRepayTxnHandler: leverage.createSellToRepayTokenLoanTxnData,
  onboardingContent: OnboardingModalContentType.MULTIPLY_WFRAGSOL,

  customLeverageQuoteParams: {
    exactIn: {
      onlyDirectRoutes: false,
      dexes: ['Whirlpool'],
      maxAccounts: 24,
    },
    exactOut: {
      onlyDirectRoutes: false,
      dexes: ['Whirlpool'],
      maxAccounts: 24,
    },
  },
  customSellToRepayQuoteParams: {
    exactIn: {
      onlyDirectRoutes: false,
      dexes: ['Whirlpool'],
      maxAccounts: 24,
    },
    exactOut: {
      onlyDirectRoutes: false,
      dexes: ['Whirlpool'],
      maxAccounts: 24,
    },
  },
}

export const MULTIPLY_PAIRS = [LRTS_PAIR, JLP_PAIR, ADRASOL_PAIR, VSOL_PAIR, WFRAGSOL_PAIR] as const

export const QUOTE_PARAMS_CONFIG_MAP: {
  [key in LendingTokenType]?: Record<string, CustomQuoteParamsConfig>
} = {
  [LendingTokenType.Usdc]: {
    //? Swap lrtsSOL/USDC pair using combined routes, because of lack of liquidity
    [lrtsSOL.LRTS_MINT.toBase58()]: {
      customSellToRepayQuoteParams: {
        exactIn: {
          onlyDirectRoutes: false,
        },
        exactOut: {
          onlyDirectRoutes: false,
        },
      },
    },
    //? Swap Banx/USDC pair using combined routes, because of lack of liquidity
    BANXbTpN8U2cU41FjPxe2Ti37PiT5cCxLUKDQZuJeMMR: {
      customSellToRepayQuoteParams: {
        exactIn: {
          onlyDirectRoutes: false,
        },
        exactOut: {
          onlyDirectRoutes: false,
        },
      },
    },
    WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U: {
      customLeverageQuoteParams: {
        exactIn: {
          onlyDirectRoutes: false,
          dexes: ['Whirlpool'],
          maxAccounts: 24,
        },
        exactOut: {
          onlyDirectRoutes: false,
          dexes: ['Whirlpool'],
          maxAccounts: 24,
        },
      },
      customSellToRepayQuoteParams: {
        exactIn: {
          onlyDirectRoutes: false,
          dexes: ['Whirlpool'],
          maxAccounts: 24,
        },
        exactOut: {
          onlyDirectRoutes: false,
          dexes: ['Whirlpool'],
          maxAccounts: 24,
        },
      },
    },
  },
}
