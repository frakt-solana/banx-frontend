'use client'

import { useRouter } from 'next/navigation'

import { BreadcrumbHeader } from '@banx/components/BreadcrumbHeader'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { PATHS } from '@banx/constants'
import { useRenderTimer } from '@banx/hooks'
import { buildUrlWithModeAndToken } from '@banx/store'

import FilterSection from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import LendVaultCard from './components/LendVaultCard'
import { useLendVaultsContent } from './hooks'

import styles from './ClientLendVaultsPage.module.scss'

export const ClientLendVaultsPage = () => {
  useRenderTimer('ClientLendVaultsPage')

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
            {vaultsPreview.map((preview) => (
              <LendVaultCard
                key={preview.vaultPubkey}
                vaultPreview={preview}
                onClick={() => handleCardClick(preview.vaultPubkey)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
