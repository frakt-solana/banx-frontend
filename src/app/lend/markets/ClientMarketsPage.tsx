'use client'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { PATHS } from '@banx/constants'
import { useFakeInfinityScroll, useRenderTimer } from '@banx/hooks'

import FilterSection from './components/FilterSection'
import LendTokenCard from './components/LendTokenCard'
import TokensListHeader from './components/TokensListHeader'
import { useMarketsView } from './hooks'

import styles from './ClientMarketsPage.module.scss'

export const ClientMarketsPage = () => {
  useRenderTimer('ClientMarketsPage')

  const {
    marketsPreview,
    onCardClick,
    emptyMessage,
    isLoading,
    sortParams,
    searchQuery,
    setSearchQuery,
    isHotFilterActive,
    isDisabledHotFilter,
    onToggleHotFilter,
    isExtraRewardFilterActive,
    onToggleExtraRewardFilter,
    isDisabledExtraRewardFilter,
    tokenType,
    setTokenType,
    selectedCategory,
    onChangeCategory,
  } = useMarketsView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Earn', path: PATHS.LEND }, { title: 'Markets' }]}
        onboardContentType="placeOffer"
      />

      <div className={styles.content}>
        <FilterSection
          sortParams={sortParams}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLendingToken={tokenType}
          handleSelectedTokenChange={setTokenType}
          selectedCategory={selectedCategory}
          onChangeCategory={onChangeCategory}
          isHotFilterActive={isHotFilterActive}
          onToggleHotFilter={onToggleHotFilter}
          isDisabledHotFilter={isDisabledHotFilter}
          isExtraRewardFilterActive={isExtraRewardFilterActive}
          onToggleExtraRewardFilter={onToggleExtraRewardFilter}
          isDisabledExtraRewardFilter={isDisabledExtraRewardFilter}
        />

        {!emptyMessage && !isLoading && <TokensListHeader />}

        {isLoading && <Loader />}
        {emptyMessage && <EmptyList message={emptyMessage} />}

        {!emptyMessage && !isLoading && (
          <div className={styles.marketsList}>
            {data.map((market) => (
              <LendTokenCard
                key={market.marketPubkey}
                market={market}
                onClick={() => onCardClick(market.marketPubkey)}
              />
            ))}
            <div ref={fetchMoreTrigger} />
          </div>
        )}
      </div>
    </div>
  )
}
