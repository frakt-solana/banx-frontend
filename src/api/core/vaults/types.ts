import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { VaultPreviewSchema } from './schemas'

//? ========= Data types =========
export type VaultPreview = z.infer<typeof VaultPreviewSchema>

//? ========= API function types =========
export type FetchVaultsPreview = (props: {
  walletPubkey: string
  tokenType?: LendingTokenType
}) => Promise<VaultPreview[]>
