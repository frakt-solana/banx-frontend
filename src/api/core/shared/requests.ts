import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { parseResponseSafe } from '../../base/helpers'
import { CollateralTokenSchema } from './schemas'
import { CollateralToken } from './types'
import { convertToMarketType } from './utils'

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
