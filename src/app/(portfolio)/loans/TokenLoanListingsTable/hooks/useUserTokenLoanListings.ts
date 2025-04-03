import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'

import { core } from '@banx/api/tokens'
import { isLoanNewer, isOptimisticLoanExpired, useTokenLoanListingsOptimistic } from '@banx/store'
import { isTokenLoanListed } from '@banx/utils'

export const USE_USER_TOKEN_LOAN_LISTINGS_QUERY_KEY = 'userTokenLoanListings'

export const useUserTokenLoanListings = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useTokenLoanListingsOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery({
    queryKey: [USE_USER_TOKEN_LOAN_LISTINGS_QUERY_KEY, walletPubkey],
    queryFn: () => core.fetchUserTokenLoanListings({ walletPubkey }),
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 1000,
    staleTime: 15 * 1000,
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
    if (!data) return []

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const nonOptimisticLoans = data.filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    const combinedActiveLoans = [
      ...nonOptimisticLoans,
      ...walletOptimisticLoans.map(({ loan }) => loan),
    ]

    return _.chain(combinedActiveLoans)
      .groupBy((loan) => loan.publicKey)
      .map((groupedLoans) => _.maxBy(groupedLoans, (loan) => loan.fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => isTokenLoanListed(loan))
      .value()
  }, [data, walletOptimisticLoans])

  return { loans, isLoading }
}
