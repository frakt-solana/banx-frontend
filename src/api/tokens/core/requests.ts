import axios from 'axios'
import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'

import { RequestWithPagination } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import { parseResponseSafe } from './../../shared/validation'
import {
  BondOfferV3Schema,
  BorrowOfferSchemaRaw,
  CollateralTokenSchema,
  MultiplyMarketDataSchema,
  TokenLoanAuctionsAndListingsSchema,
  TokenLoanSchema,
  TokenMarketPreviewSchema,
  TokenOfferPreviewSchema,
  VaultPreviewSchema,
} from './schemas'
import {
  BorrowOfferRaw,
  CollateralToken,
  MarketTokenRewardsResponse,
  MultiplyMarketData,
  TokenLoan,
  TokenLoanAuctionsAndListings,
  TokenLoanAuctionsAndListingsResponse,
  TokenMarketPreview,
  TokenMarketPreviewResponse,
  TokenOfferPreview,
  VaultPreview,
} from './types'

type FetchTokenMarketsPreview = (
  props: RequestWithPagination<{ tokenType: LendingTokenType }>,
) => Promise<TokenMarketPreview[]>
export const fetchTokenMarketsPreview: FetchTokenMarketsPreview = async ({ tokenType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<TokenMarketPreviewResponse>(
    `${BACKEND_BASE_URL}/bonds/spl/preview-v2?${queryParams.toString()}`,
  )

  return await TokenMarketPreviewSchema.array().parseAsync(data.data)
}

type FetchTokenMarketOffers = (props: {
  marketPubkey?: string
  tokenType: LendingTokenType
  getAll?: boolean
  excludeWallet?: string
}) => Promise<BondOfferV3[] | undefined>
export const fetchTokenMarketOffers: FetchTokenMarketOffers = async ({
  marketPubkey,
  tokenType,
  getAll = true,
  excludeWallet,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    excludeWallet: String(excludeWallet),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<{ data: BondOfferV3[] }>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<BondOfferV3[]>(data?.data, BondOfferV3Schema.array())
}

type FetchTokenOffersPreview = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
}) => Promise<TokenOfferPreview[] | undefined>
export const fetchTokenOffersPreview: FetchTokenOffersPreview = async ({
  walletPubkey,
  tokenType,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenOfferPreview[] }>(
    `${BACKEND_BASE_URL}/spl-offers/my-offers-v2/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenOfferPreview[]>(data?.data, TokenOfferPreviewSchema.array())
}

type FetchWalletTokenLoansAndOffers = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export const fetchWalletTokenLoansAndOffers: FetchWalletTokenLoansAndOffers = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower-v2/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data?.data, TokenLoanSchema.array())
}

type FetchTokenLenderLoans = (props: {
  walletPublicKey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>
export const fetchTokenLenderLoans: FetchTokenLenderLoans = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}

type FetchBorrowOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  customLtv: number | undefined //? base points
  excludeWallet?: string
}) => Promise<BorrowOfferRaw[] | undefined>
export const fetchBorrowOffers: FetchBorrowOffers = async (props) => {
  const { market, bondingCurveType, customLtv, excludeWallet } = props

  const queryParams = new URLSearchParams({
    market: String(market),
    bondingCurveType: String(bondingCurveType),
    excludeWallet: String(excludeWallet),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (customLtv) {
    queryParams.append('customLtv', String(customLtv))
  }

  const { data } = await axios.get<{ data: BorrowOfferRaw[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<BorrowOfferRaw[]>(data?.data, BorrowOfferSchemaRaw.array())
}

type fetchTokenLoanAuctionsAndListings = (props: {
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoanAuctionsAndListings | undefined>

export const fetchTokenLoanAuctionsAndListings: fetchTokenLoanAuctionsAndListings = async ({
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<TokenLoanAuctionsAndListingsResponse>(
    `${BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoanAuctionsAndListings>(
    data.data,
    TokenLoanAuctionsAndListingsSchema,
  )
}

type FetchUserTokenLoanListings = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export const fetchUserTokenLoanListings: FetchUserTokenLoanListings = async ({
  walletPubkey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower-requests/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}

export const fetchCollateralsList = async (props: {
  walletPubkey?: string
  marketType: LendingTokenType
  mint?: string //? If provided, only collateral with this mint will be returned
}) => {
  const { walletPubkey, marketType, mint } = props

  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(marketType)),
  })
  if (mint) {
    queryParams.append('mint', mint)
  }

  const { data } = await axios.get<{ data: CollateralToken[] }>(
    `${BACKEND_BASE_URL}/spl-assets/${walletPubkey}?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<CollateralToken[]>(data.data, CollateralTokenSchema.array())
}

export const fetchExtraTokenReward = async (): Promise<MarketTokenRewardsResponse> => {
  const { data } = await axios.get<MarketTokenRewardsResponse>('/rewards.json')
  return data
}

type FetchVaultsPreview = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
}) => Promise<VaultPreview[]>
export const fetchVaultsPreview: FetchVaultsPreview = async ({ walletPubkey, tokenType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (tokenType) {
    queryParams.append('marketType', convertToMarketType(tokenType))
  }

  const { data } = await axios.get<{ data: VaultPreview[] }>(
    `${BACKEND_BASE_URL}/vaults/preview?walletPublicKey=${walletPubkey}&${queryParams.toString()}`,
  )

  return await VaultPreviewSchema.array().parseAsync(data.data)
}

type FetchMultiplyMarketData = (params: {
  marketPubkey: string
  minPositionSize?: number
}) => Promise<MultiplyMarketData | undefined>
export const fetchMultiplyMarketData: FetchMultiplyMarketData = async ({
  marketPubkey,
  minPositionSize = 1e6,
}) => {
  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketPubkey: marketPubkey,
    minPositionSize: minPositionSize.toString(),
  })

  const { data } = await axios.get(
    `${BACKEND_BASE_URL}/spl-offers/multiply?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<MultiplyMarketData>(data, MultiplyMarketDataSchema)
}
