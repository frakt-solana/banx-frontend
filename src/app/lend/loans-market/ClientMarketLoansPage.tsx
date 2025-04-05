'use client'

import { FC, useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import { Button } from '@banx/components/Buttons'
import {
  FilterDropdown,
  MARKET_OPTIONS_WITHOUT_ALL,
  TokenDropdown,
} from '@banx/components/Dropdowns'
import EmptyList from '@banx/components/EmptyList'
import { Search } from '@banx/components/Search'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { TokenLoan } from '@banx/api'
import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { Hourglass, Snowflake } from '@banx/icons'
import { ViewState, buildUrlWithModeAndToken, useTableView } from '@banx/store'

import { MarketLoansSummary } from './components/MarketLoansSummary'
import { getTableColumns } from './components/MarketLoansTable/columns'
import { useMarketLoansState, useMarketLoansView } from './hooks'

import styles from './ClientMarketLoansPage.module.scss'

export const ClientMarketLoansPage = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkey = walletPublicKey?.toBase58() ?? ''
  const { viewState } = useTableView()

  const {
    loans,
    loading,
    isNoLoans,
    filteredListEmptyMessage,
    tokenType,
    setTokenType,
    searchQuery,
    setSearchQuery,
    auctionLoansAmount,
    freezeLoansAmount,
    isAuctionFilterEnabled,
    toggleAuctionFilter,
    isFreezeFilterEnabled,
    toggleFreezeFilter,
    sortViewParams,
  } = useMarketLoansView()

  const {
    selection,
    toggle: toggleLoanInSelection,
    find: findLoanInSelection,
    clear: clearSelection,
    set: setSelection,
  } = useMarketLoansState()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const hasSelectedLoans = !!selection.length

  const loansToSelect = useMemo(() => {
    return loans.filter((loan) => loan.bondTradeTransaction.user !== walletPubkey)
  }, [loans, walletPubkey])

  const onSelectAll = () => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loansToSelect)
    }
  }

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    toggleLoanInSelection,
    findLoanInSelection,
    onSelectAll,
    hasSelectedLoans,
  })

  const onRowClick = useCallback(
    (loan: TokenLoan) => {
      const canSelect = loan.bondTradeTransaction.user !== walletPubkey
      if (!canSelect) return

      toggleLoanInSelection(loan)
    },
    [toggleLoanInSelection, walletPubkey],
  )

  const rowParams = useMemo(() => {
    return {
      onRowClick,
    }
  }, [onRowClick])

  const customJSX = (
    <>
      <TokenDropdown
        option={tokenType}
        options={MARKET_OPTIONS_WITHOUT_ALL}
        onChange={setTokenType}
      />
      <FilterDropdown>
        <div className={styles.filterButtonsContainer}>
          <span className={styles.filterButtonsTitle}>Tags</span>
          <div className={styles.filterButtons}>
            <AuctionFilterButton
              loansAmount={auctionLoansAmount}
              isActive={isAuctionFilterEnabled}
              onClick={toggleAuctionFilter}
            />
            <FreezeFilterButton
              loansAmount={freezeLoansAmount}
              isActive={isFreezeFilterEnabled}
              onClick={toggleFreezeFilter}
            />
          </div>
        </div>
      </FilterDropdown>
      <Search value={searchQuery} onChange={setSearchQuery} />
    </>
  )

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Earn', path: PATHS.LEND }, { title: 'Loans market' }]}
        onboardContentType="loansMarket"
      />

      <div className={styles.tableRoot}>
        <Table
          data={loans}
          columns={columns}
          className={styles.table}
          rowParams={rowParams}
          sortViewParams={sortViewParams}
          loading={loading}
          customJSX={customJSX}
          emptyMessage={isNoLoans ? <NoLoans /> : <EmptyList message={filteredListEmptyMessage} />}
          showCard
        />

        {!isNoLoans && !filteredListEmptyMessage && !loading && (
          <MarketLoansSummary loans={loans} />
        )}
      </div>
    </div>
  )
}

const NoLoans = () => {
  const router = useRouter()

  const goToLendPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND, null))
  }

  return (
    <EmptyList
      message={MESSAGES.LENDER_NO_LOANS}
      buttonProps={{ text: 'Lend', onClick: goToLendPage }}
    />
  )
}

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  loansAmount: number | null
}

const AuctionFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Expiring loans' : 'No expiring loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.auction)}
      data-loans-amount={loansAmount}
    >
      <Button
        className={classNames(
          styles.auctionFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <Hourglass className={styles.hourglassIcon} />
        Expiring
      </Button>
    </div>
  </Tooltip>
)

const FreezeFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Loans with freeze' : 'No loans with freeze currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.freeze)}
      data-loans-amount={loansAmount}
    >
      <Button
        className={classNames(
          styles.freezeFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="tertiary"
        type="circle"
      >
        <Snowflake className={styles.snowflakeIcon} />
        Freeze
      </Button>
    </div>
  </Tooltip>
)
