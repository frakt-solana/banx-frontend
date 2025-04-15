'use client'

import { FC, ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useRouter } from 'next/navigation'

import { Button } from '@banx/components/Buttons'
import { OnboardingCarousel } from '@banx/components/OnboardingCarousel'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

import { PATHS } from '@banx/constants'
import { CircleCheck, Pencil, SOL, Shield, TableView, USDC } from '@banx/icons'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useTokenType } from '@banx/store/common'
import { isUsdcTokenType } from '@banx/utils/tokens'

import styles from './ClientLandingLendPage.module.scss'

export const ClientLandingLendPage = () => {
  const router = useRouter()
  const { tokenType } = useTokenType()

  const handleGoToVaultsPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND_VAULTS, tokenType))
  }

  const handleGoToPlaceOfferPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND_MARKERS, tokenType))
  }

  const handleGoToLoanMarketPage = () => {
    router.push(buildUrlWithModeAndToken(PATHS.LEND_LOANS_MARKET, tokenType))
  }

  return (
    <div className={styles.landingPageWrapper}>
      <div className={styles.landingPageSection}>
        <div className={styles.introSection}>
          <h3>Lend your assets</h3>
          <p>
            Earn high yield on your SOL or USDC through active or passive lending and get returns
            while your funds are idle
          </p>
        </div>

        <OnboardingCarousel contentType="lendToken" />
      </div>

      <TokenSwitcher />

      <div className={styles.overviewContainer}>
        <OverviewBlock
          icon={<Shield />}
          title="Vaults"
          apy="10% - 34% APY"
          features={['Passive Yield', 'Low Risk', 'Curated Strategies']}
          buttonText="Deposit to vault"
          onClick={handleGoToVaultsPage}
          tokenType={tokenType}
        />
        <OverviewBlock
          icon={<Pencil />}
          title="Place offer"
          apy="Up to 500% APY"
          features={['Flexible Settings', 'Customizable Yield', 'Full Control']}
          buttonText="Create offer"
          onClick={handleGoToPlaceOfferPage}
          tokenType={tokenType}
        />
        <OverviewBlock
          icon={<TableView />}
          title="Loans market"
          apy="30% - 80% APY"
          features={['Instant yield']}
          buttonText="Explore market"
          onClick={handleGoToLoanMarketPage}
          tokenType={tokenType}
        />
      </div>
    </div>
  )
}

interface OverviewBlockProps {
  icon: ReactNode
  title: string
  apy: string
  features: string[]
  buttonText: string
  onClick: () => void
  tokenType: LendingTokenType
}

const OverviewBlock: FC<OverviewBlockProps> = ({
  icon,
  title,
  apy,
  features,
  buttonText,
  onClick,
  tokenType,
}) => (
  <div onClick={onClick} className={styles.overviewBlock}>
    <div className={styles.overviewBlockHeader}>
      {icon}
      <h3>{title}</h3>
    </div>
    <div className={styles.apyContainer}>
      {isUsdcTokenType(tokenType) ? <USDC /> : <SOL />}
      <span>{apy}</span>
    </div>
    <ul className={styles.featuresList}>
      {features.map((feature, index) => (
        <li key={index} className={styles.featuresListItem}>
          <CircleCheck />
          {feature}
        </li>
      ))}
    </ul>
    <Button variant="secondary">{buttonText}</Button>
  </div>
)
