import axios from 'axios'
import { BN } from 'fbonds-core'

import { ZERO_BN } from '@banx/utils/bn'
import { convertApyToApr } from '@banx/utils/common'

const FRAGMENTIC_API_URL = 'https://api.fragmetric.xyz'

//? Type is only partially described! To get apy only
type FragmenticAddressesResponseData = Record<
  string,
  {
    address: string
    data: {
      apy: number
    }
    symbol: string
  }
>

export const fetchFragSolApr = async () => {
  const FRAG_SOL_MINT = 'FRAGSEthVFL7fdqM8hxfxkfCZzUvmg21cqPJVvC1qdbo'

  const { data } = await axios.get<FragmenticAddressesResponseData>(
    `${FRAGMENTIC_API_URL}/v1/public/feeds?addresses=${FRAG_SOL_MINT}`,
  )

  const apy = data[FRAG_SOL_MINT]?.data?.apy * 100 || 0

  const apr = convertApyToApr(apy || 0, 12)

  if (!apr) return ZERO_BN

  return new BN(apr * 100)
}
