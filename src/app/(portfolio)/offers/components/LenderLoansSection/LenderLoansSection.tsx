import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { MESSAGES, PATHS } from '@banx/constants'
import { useFakeInfinityScroll } from '@banx/hooks'
import { buildUrlWithModeAndToken } from '@banx/store'

import CollateralLoansCard from './components/CollateralLoansCard'
import { FilterSection } from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import { useLenderLoansView } from './hooks'

import styles from './LenderLoansSection.module.scss'

const LenderTokenLoansContent = () => {
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
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    liquidatedLoansAmount,
    isLiquidatedFilterEnabled,
    toggleLiquidatedFilter,
    underwaterLoansAmount,
    isUnderwaterFilterEnabled,
    toggleUnderwaterFilter,
    expandedPreviewId,
    handleCardToggle,
    sortParams,
  } = useLenderLoansView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loansPreviews })

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
        liquidatedLoansAmount={liquidatedLoansAmount}
        isTerminationFilterEnabled={isTerminationFilterEnabled}
        toggleTerminationFilter={toggleTerminationFilter}
        isLiquidatedFilterEnabled={isLiquidatedFilterEnabled}
        toggleLiquidatedFilter={toggleLiquidatedFilter}
        underwaterLoansAmount={underwaterLoansAmount}
        toggleUnderwaterFilter={toggleUnderwaterFilter}
        isUnderwaterFilterEnabled={isUnderwaterFilterEnabled}
      />

      {!isNoLoans && !isFilteredListEmpty && !isLoading && <HeaderList />}

      {isLoading && <Loader />}
      {isNoLoans && <NoLoans />}
      {isFilteredListEmpty && !isNoLoans && <EmptyList message={filteredListEmptyMessage} />}

      {!isNoLoans && !isLoading && (
        <div className={styles.cardsList}>
          {data.map((preview) => (
            <CollateralLoansCard
              key={preview.id}
              loansPreview={preview}
              onClick={() => handleCardToggle(preview.id)}
              isExpanded={expandedPreviewId === preview.id}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

export default LenderTokenLoansContent

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
