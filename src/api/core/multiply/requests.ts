import axios from 'axios'

import { parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { MultiplyMarketDataSchema } from './schemas'
import { MultiplyMarketData } from './types'

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
