import { z } from 'zod'

import { UserEscrowSchema } from './schemas'

//? ========= Data types =========
export type UserEscrow = z.infer<typeof UserEscrowSchema>

//? ========= API function types =========
export type FetchUserEscrows = (props: {
  walletPublicKey: string
}) => Promise<UserEscrow[] | undefined>
