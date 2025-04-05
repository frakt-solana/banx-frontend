import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { convertToMarketType } from '@banx/api/helpers'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { VaultPreviewSchema } from './schemas'
import { VaultPreview } from './types'

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
