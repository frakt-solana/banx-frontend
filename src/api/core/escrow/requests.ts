import axios from 'axios'

import { parseResponseSafe } from '@banx/api/helpers'
import { BACKEND_BASE_URL } from '@banx/constants'

import { UserEscrowSchema } from './schemas'
import { FetchUserEscrows } from './types'

export const fetchUserEscrows: FetchUserEscrows = async ({ walletPublicKey }) => {
  const { data } = await axios.get(`${BACKEND_BASE_URL}/vault/${walletPublicKey}`)

  return await parseResponseSafe(data?.data, UserEscrowSchema.array())
}
