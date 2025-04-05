import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'

import { fetchWalletTokenLoansAndOffers } from '@banx/api'
import { AssetType, stats } from '@banx/api/common'
import { USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY } from '@banx/providers/query'
import {
  isLoanNewer,
  isOptimisticLoanExpired,
  useTokenLoansOptimistic,
  useTokenType,
} from '@banx/store'
import { isTokenLoanLiquidated, isTokenLoanRepaid } from '@banx/utils'

export const useLoansData = (strictTokenType?: LendingTokenType) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkey = walletPublicKey?.toBase58() || ''

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useTokenLoansOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery({
    queryKey: [USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY, walletPubkey, strictTokenType],
    queryFn: () =>
      fetchWalletTokenLoansAndOffers({
        walletPublicKey: walletPubkey,
        tokenType: strictTokenType,
      }),
    enabled: !!walletPubkey,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, //? 5 minutes
  })

  const walletOptimisticLoans = useMemo(() => {
    if (!walletPubkey) return []
    return optimisticLoans.filter(({ wallet }) => wallet === walletPubkey)
  }, [optimisticLoans, walletPubkey])

  //? Check same active loans (duplicated with BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !walletPubkey) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, walletPubkey),
    )

    const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
      const sameLoanFromBE = data.find(({ publicKey }) => publicKey === loan.publicKey)
      if (!sameLoanFromBE) return false
      const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
      return isBELoanNewer
    })

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        _.map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        walletPubkey,
      )
    }
  }, [data, isFetched, walletPubkey, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const nonOptimisticLoans = data.filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )
    const combinedActiveLoans = [
      ...nonOptimisticLoans,
      ...walletOptimisticLoans.map(({ loan }) => loan),
    ]

    //? Filter out repaid loans and liquidated loans
    return _.chain(combinedActiveLoans)
      .groupBy((loan) => loan.publicKey)
      .map((groupedLoans) => _.maxBy(groupedLoans, (loan) => loan.fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => !isTokenLoanRepaid(loan))
      .filter((loan) => !isTokenLoanLiquidated(loan))
      .value()
  }, [data, walletOptimisticLoans])

  return {
    loans,
    isLoading,
  }
}

export const useLoansStatsData = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery({
    queryKey: ['userLoansStats', walletPubkey, tokenType],
    queryFn: () =>
      stats.fetchUserLoansStats({
        walletPubkey: walletPubkey,
        marketType: tokenType,
        tokenType: AssetType.SPL,
      }),
    enabled: !!walletPubkey,
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 1000,
    staleTime: 15 * 1000,
  })

  return {
    data,
    isLoading,
  }
}
