import axios from 'axios'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../shared'
import { VaultPreviewSchema } from './schemas'
import { FetchVaultsPreview, VaultPreview } from './types'

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
