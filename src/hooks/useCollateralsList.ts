import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { CollateralToken, core } from '@banx/api'
import { USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { useTokenType } from '@banx/store'
import { bnToHuman } from '@banx/utils/bn'
import { isBanxSolTokenType } from '@banx/utils/tokens'

export const useCollateralsList = (strictTokenType?: LendingTokenType) => {
  const { publicKey } = useWallet()
  const { tokenType: appTokenType } = useTokenType()

  const tokenType = strictTokenType || appTokenType

  const { data, isLoading } = useQuery({
    queryKey: ['collateralsList', publicKey, tokenType],
    queryFn: () =>
      core.fetchCollateralsList({ walletPubkey: publicKey?.toBase58(), marketType: tokenType }),
    refetchOnWindowFocus: false,
    refetchInterval: 10_000,
    staleTime: 10_000,
  })

  const collateralsList: CollateralToken[] = useMemo(() => {
    if (!data) return []

    const collateralMintToRemove = isBanxSolTokenType(tokenType) ? WSOL_ADDRESS : USDC_ADDRESS

    return _.chain(data)
      .filter((token) => token.collateral.mint !== collateralMintToRemove)
      .sortBy((token) => -calculateCollateralValueInUsd(token))
      .value()
  }, [data, tokenType])

  return { collateralsList, isLoading }
}

const calculateCollateralValueInUsd = (token: core.CollateralToken) => {
  const { collateral, amountInWallet, collateralPrice } = token
  return (bnToHuman(amountInWallet, collateral.decimals) * collateralPrice) / 100
}
