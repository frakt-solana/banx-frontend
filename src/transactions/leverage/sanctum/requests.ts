import axios from 'axios'
import { BN } from 'fbonds-core'

import { ZERO_BN, convertApyToApr } from '@banx/utils'

const SANCTUM_EXTRA_API_URL = 'https://extra-api.sanctum.so'

export const fetchSanctumLstApr = async (mint: string) => {
  const { data } = await axios.get<{ apys: Record<string, number> }>(
    `${SANCTUM_EXTRA_API_URL}/v1/apy/latest?lst=${mint}`,
  )

  const apy = data.apys[mint] * 100 || 0

  const apr = convertApyToApr(apy || 0, 12)

  if (!apr) return ZERO_BN

  return new BN(apr * 100)
}
