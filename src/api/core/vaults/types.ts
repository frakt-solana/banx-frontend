import { z } from 'zod'

import { VaultPreviewSchema } from './schemas'

export type VaultPreview = z.infer<typeof VaultPreviewSchema>
