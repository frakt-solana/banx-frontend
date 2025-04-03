import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const JUPITER_API_URL = 'https://api.jup.ag/price/v2'

const fetchTokenPrice = async (tokenMint: string): Promise<number> => {
  const { data } = await axios.get(JUPITER_API_URL, { params: { ids: tokenMint } })

  const price = data.data?.[tokenMint]?.price ?? '0'
  return parseFloat(price)
}

export const useTokenPrice = (tokenMint: string) => {
  return useQuery({
    queryKey: ['tokenPrice', tokenMint],
    queryFn: () => fetchTokenPrice(tokenMint),
    staleTime: 60 * 1000,
    enabled: Boolean(tokenMint),
  })
}
