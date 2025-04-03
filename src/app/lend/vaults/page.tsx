'use client'

import { useRouter } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { PATHS } from '@banx/constants'
import { useFakeInfinityScroll } from '@banx/hooks'
import { buildUrlWithModeAndToken } from '@banx/store'

import FilterSection from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import LendVaultCard from './components/LendVaultCard'
import { useLendVaultsContent } from './hooks'

import styles from './page.module.scss'

const LendVaultsPage = () => {
  const router = useRouter()

  const {
    vaultsPreview,
    emptyMessage,
    isLoading,
    sortParams,
    searchQuery,
    setSearchQuery,
    selectedLendingToken,
    handleSelectedTokenChange,
    isUserDepositFilterEnabled,
    toggleUserDepositFilter,
    depositedVaultsAmount,
  } = useLendVaultsContent()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: vaultsPreview })

  const handleCardClick = (vaultPubkey: string) => {
    const basePath = `${PATHS.LEND_VAULTS}/${vaultPubkey}`
    router.push(buildUrlWithModeAndToken(basePath, null))
  }

  return (
    <div className={styles.pageWrapper}>
      <BreadcrumbHeader
        breadcrumbs={[{ title: 'Lend', path: PATHS.LEND }, { title: 'Vaults' }]}
        onboardContentType="vaults"
      />

      <div className={styles.content}>
        <FilterSection
          sortParams={sortParams}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLendingToken={selectedLendingToken}
          handleSelectedTokenChange={handleSelectedTokenChange}
          isUserDepositFilterEnabled={isUserDepositFilterEnabled}
          toggleUserDepositFilter={toggleUserDepositFilter}
          depositedVaultsAmount={depositedVaultsAmount}
        />

        {!emptyMessage && <HeaderList />}

        {isLoading && <Loader />}
        {emptyMessage && <EmptyList message={emptyMessage} />}

        {!emptyMessage && (
          <div className={styles.vaultsList}>
            {data.map((preview) => (
              <LendVaultCard
                key={preview.vaultPubkey}
                vaultPreview={preview}
                onClick={() => handleCardClick(preview.vaultPubkey)}
              />
            ))}
            <div ref={fetchMoreTrigger} />
          </div>
        )}
      </div>
    </div>
  )
}

export default LendVaultsPage
