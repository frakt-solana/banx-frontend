import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty, orderBy } from 'lodash'

import { MarketTokenType } from '@banx/components/Dropdowns'
import { filterBySearchQuery } from '@banx/components/Search'
import { SortOption } from '@banx/components/SortDropdown'

import { VaultPreview, fetchVaultsPreview } from '@banx/api'
import { MESSAGES } from '@banx/constants'
import { queryClient } from '@banx/providers/query'
import { ZERO_BN } from '@banx/utils/bn'

const USE_VAULTS_PREVIW_QUERY_KEY = 'vaultsPreview'
const createUserVaultQueryKey = (walletPubkey: string, strictLendingToken?: LendingTokenType) => [
  USE_VAULTS_PREVIW_QUERY_KEY,
  strictLendingToken,
  walletPubkey,
]

export const useVaultsPreview = (strictLendingToken?: LendingTokenType) => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery({
    queryKey: createUserVaultQueryKey(walletPubkey, strictLendingToken),
    queryFn: () => fetchVaultsPreview({ walletPubkey, tokenType: strictLendingToken }),
    refetchOnWindowFocus: false,
    staleTime: 15000,
  })

  return {
    vaultsPreview: data ?? [],
    isLoading,
  }
}

type UpdateVaultPreviewBaseOptions = {
  walletPubkey: string
  vaultPubkey: string
}

type UpdateDepositVaultPreviewOptions = UpdateVaultPreviewBaseOptions & {
  amount: BN
}
export const updateDepositVaultPreviewOptimistic = ({
  walletPubkey,
  vaultPubkey,
  amount,
}: UpdateDepositVaultPreviewOptions) => {
  queryClient.setQueryData(
    createUserVaultQueryKey(walletPubkey),
    (queryData: VaultPreview[] | undefined) => {
      if (!queryData) return queryData

      return queryData.map((vault) => {
        if (vault.vaultPubkey !== vaultPubkey) {
          return vault
        }

        const updatedDepositedAmount = new BN(vault.userTotalDepositedAmount).add(amount)

        return {
          ...vault,
          userTotalDepositedAmount: updatedDepositedAmount.toNumber(),
        }
      })
    },
  )
}

type UpdateWithdrawVaultPreviewOptions = UpdateVaultPreviewBaseOptions & {
  amount: BN
}
export const updateWithdrawVaultPreviewOptimistic = ({
  walletPubkey,
  vaultPubkey,
  amount,
}: UpdateWithdrawVaultPreviewOptions) => {
  queryClient.setQueryData(
    createUserVaultQueryKey(walletPubkey),
    (queryData: VaultPreview[] | undefined) => {
      if (!queryData) return queryData

      return queryData.map((vault) => {
        if (vault.vaultPubkey !== vaultPubkey) {
          return vault
        }

        const reservesAmount = new BN(vault.reserves)
        const remainingAmount = amount.sub(reservesAmount)

        const updatedReserves = reservesAmount.gte(amount) ? reservesAmount.sub(amount) : ZERO_BN
        const updatedDepositedAmount = reservesAmount.gte(amount)
          ? new BN(vault.userTotalDepositedAmount).sub(amount)
          : new BN(vault.userTotalDepositedAmount)

        const requestedWithdrawAmount = BN.max(
          ZERO_BN,
          new BN(vault.requestedWithdrawAmount).add(remainingAmount),
        )

        return {
          ...vault,
          reserves: updatedReserves.toNumber(),
          requestedWithdrawAmount: requestedWithdrawAmount.toNumber(),
          userTotalDepositedAmount: updatedDepositedAmount.toNumber(),
        }
      })
    },
  )
}

type UpdateClaimVaultPreviewOptions = UpdateVaultPreviewBaseOptions
export const updateClaimVaultPreviewOptimistic = ({
  walletPubkey,
  vaultPubkey,
}: UpdateClaimVaultPreviewOptions) => {
  queryClient.setQueryData(
    createUserVaultQueryKey(walletPubkey),
    (queryData: VaultPreview[] | undefined) => {
      if (!queryData) return queryData

      return queryData.map((vault) => {
        if (vault.vaultPubkey !== vaultPubkey) {
          return vault
        }

        return { ...vault, pendingClaimAmount: 0 }
      })
    },
  )
}

export const useLendVaultsContent = () => {
  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')
  const [isUserDepositFilterEnabled, setIsUserDepositFilterEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { vaultsPreview, isLoading } = useVaultsPreview(
    selectedLendingToken === 'ALL' ? undefined : selectedLendingToken,
  )

  const handleSelectedTokenChange = (value: MarketTokenType) => {
    setSelectedLendingToken(value)
  }

  const toggleUserDepositFilter = () => {
    setIsUserDepositFilterEnabled(!isUserDepositFilterEnabled)
  }

  const filtereMarketsBySearch = useMemo(() => {
    return filterBySearchQuery(vaultsPreview, searchQuery, [(market) => market.vaultName])
  }, [vaultsPreview, searchQuery])

  const userDepositedVaults = useMemo(() => {
    return filtereMarketsBySearch.filter((vault) => vault.userTotalDepositedAmount > 0)
  }, [filtereMarketsBySearch])

  const filteredVaults = useMemo(() => {
    if (isUserDepositFilterEnabled) {
      return userDepositedVaults
    }
    return filtereMarketsBySearch
  }, [isUserDepositFilterEnabled, filtereMarketsBySearch, userDepositedVaults])

  const { sortedData, sortParams } = useSortedVaultsPreview(filteredVaults)

  const isNoVaults = !isLoading && isEmpty(vaultsPreview)
  const isFilteredListEmpty = !isLoading && isEmpty(filteredVaults)

  const emptyMessage = (() => {
    if (isNoVaults) return MESSAGES.NO_VAULTS_AVAILABLE
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return MESSAGES.EMPTY_FILTERED_LIST
    return
  })()

  return {
    vaultsPreview: sortedData,
    emptyMessage,
    isLoading,

    sortParams,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    isUserDepositFilterEnabled,
    toggleUserDepositFilter,
    depositedVaultsAmount: userDepositedVaults.length,
  }
}

export enum SortField {
  TVL = 'tvl',
  CURRENT_APY = 'currentApy',
  TARGET_APY = 'targetApy',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'TVL', value: [SortField.TVL, 'desc'] },
  { label: 'Current APY', value: [SortField.CURRENT_APY, 'desc'] },
  { label: 'Target APY', value: [SortField.TARGET_APY, 'desc'] },
]

type SortValueGetter = (preview: VaultPreview) => number

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.TVL]: (preview) => preview.totalDepositedAmount,
  [SortField.CURRENT_APY]: (preview) => preview.currentApy,
  [SortField.TARGET_APY]: (preview) => preview.targetApy,
}

export const useSortedVaultsPreview = (vaultsPreview: VaultPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedData = useMemo(() => {
    if (!sortOption) return vaultsPreview

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(vaultsPreview, sortValueGetter, order)
  }, [sortOption, vaultsPreview])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedData,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
