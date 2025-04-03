import { BN, web3 } from 'fbonds-core'
import { offer as tokenOfferUtils } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { OnboardingModalContentType } from '@banx/components/modals'

import { CustomQuoteParams } from '@banx/api/common'
import { CreateLeverageTxnData } from '@banx/transactions/leverage/common/createLeverageTxnData'
import { CreateSellToRepayTokenLoanTxnData } from '@banx/transactions/leverage/common/createSellToRepayTokenLoanTxnData'

export type LeverageSimpleOffer = {
  maxCollateralToReceive: BN
  maxMultiplier: number
} & tokenOfferUtils.SimpleOffer

export type CustomQuoteParamsConfig = {
  customLeverageQuoteParams?: {
    exactIn?: CustomQuoteParams
    exactOut?: CustomQuoteParams
  }

  customSellToRepayQuoteParams?: {
    exactIn?: CustomQuoteParams
    exactOut?: CustomQuoteParams
  }
}

export type MultiplyPair = {
  collateralTicker: string
  collateralLogoUrl: string

  collateralMint: web3.PublicKey
  getCollateralYield?: () => Promise<BN>
  marketTokenType: LendingTokenType
  marketPublicKey: web3.PublicKey
  //? Max loan value user can borrow per 1 loan
  loanValueLimit?: BN
  //? Optional param that represents minimum position size. Used to calculate max net apr, max multiply,
  //? filter almost empty offers. Used by default value in Multiply form
  //? Mustn't prevent user to enter any value in multiply field
  minPositionSize?: BN

  createLeverageTxnHandler: CreateLeverageTxnData
  createSellToRepayTxnHandler: CreateSellToRepayTokenLoanTxnData

  onboardingContent: OnboardingModalContentType

  getNonJupLeverageConversionRate?: (connection: web3.Connection) => Promise<number>
  getNonJupSellToRepayConversionRate?: (connection: web3.Connection) => Promise<number>
} & CustomQuoteParamsConfig
