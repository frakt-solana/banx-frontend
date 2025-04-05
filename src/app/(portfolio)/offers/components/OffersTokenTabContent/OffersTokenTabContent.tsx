import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { PATHS } from '@banx/constants'
import { MESSAGES } from '@banx/constants/messages'
import { useFakeInfinityScroll } from '@banx/hooks'
import { buildUrlWithModeAndToken } from '@banx/store'

import FilterSection from '../FilterSection'
import OfferTokenCard from '../OfferTokenCard'
import TokensListHeader from '../TokensListHeader'
import { useOffersTokenContent } from './hooks'

import styles from './OffersTokenTabContent.module.scss'

const OffersTokenTabContent = () => {
  const { connected } = useWallet()

  const {
    offersPreview,
    isLoading,
    isNoOffers,
    isFilteredListEmpty,
    filteredListEmptyMessage,
    sortParams,
    visibleOfferPubkey,
    onCardClick,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    selectedCategory,
    onChangeCategory,
  } = useOffersTokenContent()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: offersPreview })

  if (!connected) return <EmptyList message={MESSAGES.NO_CONNECTED_OFFERS} />

  return (
    <div className={styles.content}>
      <FilterSection
        sortParams={sortParams}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLendingToken={selectedLendingToken}
        handleSelectedTokenChange={handleSelectedTokenChange}
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
      />

      {!isNoOffers && !isFilteredListEmpty && !isLoading && <TokensListHeader />}

      {isLoading && <Loader />}
      {isNoOffers && <NoOffers />}
      {isFilteredListEmpty && !isNoOffers && <EmptyList message={filteredListEmptyMessage} />}

      {!isNoOffers && !isLoading && (
        <div className={styles.offersList}>
          {data.map((offerPreview) => (
            <OfferTokenCard
              key={offerPreview.publicKey}
              offerPreview={offerPreview}
              onToggleCard={() => onCardClick(offerPreview.publicKey)}
              isOpen={visibleOfferPubkey === offerPreview.publicKey}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

export default OffersTokenTabContent

const NoOffers = () => {
  const router = useRouter()

  const goToLendPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND, null))
  }

  return (
    <EmptyList
      message={MESSAGES.LENDER_NO_OFFERS}
      buttonProps={{ text: 'Lend', onClick: goToLendPage }}
    />
  )
}
