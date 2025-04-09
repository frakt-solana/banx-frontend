'use client'

import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { MARKET_OPTIONS, MarketTokenType, TokenDropdown } from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'
import { Search, filterBySearchQuery } from '@banx/components/Search'

import { MESSAGES, NO_LOANS_IN_MARKET_MESSAGE, PATHS } from '@banx/constants'
import { buildUrlWithModeAndToken } from '@banx/store'

import { useLoansData } from '../loans/ActiveLoansSection/hooks'
import { HeaderList } from './components/HeaderList'
import LeveragePositionCard from './components/LeveragePositionCard'

import styles from './ClientPositionsPage.module.scss'

export const ClientPositionsPage = () => {
  const { connected } = useWallet()

  const { loans, isLoading } = useLoansData()

  const leverageLoans = useMemo(
    () => loans.filter((loan) => loan.fraktBond.leverageBasePoints),
    [loans],
  )

  const [selectedLendingToken, setSelectedLendingToken] = useState<MarketTokenType>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredByLendingToken = useMemo(() => {
    if (selectedLendingToken === 'ALL') return leverageLoans
    return leverageLoans.filter(
      (loan) => loan.bondTradeTransaction.lendingToken === selectedLendingToken,
    )
  }, [leverageLoans, selectedLendingToken])

  const filteredBySearchQuery = useMemo(() => {
    return filterBySearchQuery(filteredByLendingToken, searchQuery, [
      (loan) => loan.collateral.mint,
      (loan) => loan.collateral.ticker,
    ])
  }, [filteredByLendingToken, searchQuery])

  const isNoLoans = _.isEmpty(leverageLoans) && !isLoading
  const isFilteredListEmpty = _.isEmpty(filteredBySearchQuery) && !isLoading

  const filteredListEmptyMessage = (() => {
    if (isFilteredListEmpty && searchQuery) return MESSAGES.EMPTY_SEARCH_RESULTS
    if (isFilteredListEmpty) return NO_LOANS_IN_MARKET_MESSAGE(leverageLoans.length)
    return ''
  })()

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Portfolio', path: PATHS.PORTFOLIO }, { title: 'My multiplies' }]}
      />

      {!connected && <EmptyList message={MESSAGES.NO_CONNECTED_LOANS} />}

      {connected && (
        <div className={styles.content}>
          <div className={styles.filterContainer}>
            <div className={styles.filterContent}>
              <TokenDropdown
                option={selectedLendingToken}
                options={MARKET_OPTIONS}
                onChange={setSelectedLendingToken}
              />
              <Search value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          {!isNoLoans && !isFilteredListEmpty && !isLoading && <HeaderList />}

          {isLoading && <Loader />}
          {isNoLoans && <NoLoans />}
          {isFilteredListEmpty && !isNoLoans && <EmptyList message={filteredListEmptyMessage} />}

          {!isNoLoans && !isLoading && (
            <div className={styles.cardsList}>
              {filteredBySearchQuery.map((loan) => (
                <LeveragePositionCard key={loan.publicKey} loan={loan} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const NoLoans = () => {
  const router = useRouter()

  const goToLeveragePage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEVERAGE_BASE, null))
  }

  return (
    <EmptyList
      message={MESSAGES.NO_MULTIPLIER_POSITIONS}
      buttonProps={{ text: 'Multiply', onClick: goToLeveragePage }}
    />
  )
}
