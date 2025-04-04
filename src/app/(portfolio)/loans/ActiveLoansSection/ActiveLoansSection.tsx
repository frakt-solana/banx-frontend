import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { buildUrlWithModeAndToken } from '@banx/store'

import CollateralLoansCard from './components/CollateralLoansCard'
import { FilterSection } from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import { useLoansView } from './hooks/useLoansView'

import styles from './ActiveLoansSection.module.scss'

const ActiveLoansSection = () => {
  const { connected } = useWallet()

  const {
    loansPreviews,
    isLoading,
    isNoLoans,
    isFilteredListEmpty,
    filteredListEmptyMessage,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
    expandedPreviewId,
    handleCardToggle,
    sortParams,
  } = useLoansView()

  if (!connected) return <EmptyList message={MESSAGES.NO_CONNECTED_LOANS} />

  return (
    <div className={styles.content}>
      <FilterSection
        sortParams={sortParams}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLendingToken={selectedLendingToken}
        handleSelectedTokenChange={handleSelectedTokenChange}
        terminatingLoansAmount={terminatingLoansAmount}
        repaymentCallsAmount={repaymentCallsAmount}
        isTerminationFilterEnabled={isTerminationFilterEnabled}
        toggleTerminationFilter={toggleTerminationFilter}
        isRepaymentCallFilterEnabled={isRepaymentCallFilterEnabled}
        toggleRepaymentCallFilter={toggleRepaymentCallFilter}
      />

      {!isNoLoans && !isFilteredListEmpty && !isLoading && <HeaderList />}

      {isLoading && <Loader />}
      {isNoLoans && <NoLoans />}
      {isFilteredListEmpty && !isNoLoans && <EmptyList message={filteredListEmptyMessage} />}

      {!isNoLoans && !isLoading && (
        <div className={styles.cardsList}>
          {loansPreviews.map((preview) => (
            <CollateralLoansCard
              key={preview.id}
              loansPreview={preview}
              onClick={() => handleCardToggle(preview.id)}
              isExpanded={expandedPreviewId === preview.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ActiveLoansSection

const NoLoans = () => {
  const router = useRouter()

  const goToBorrowPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.BORROW, null))
  }

  return (
    <EmptyList
      message={MESSAGES.BORROWER_NO_LOANS}
      buttonProps={{ text: 'Borrow', onClick: goToBorrowPage }}
    />
  )
}
