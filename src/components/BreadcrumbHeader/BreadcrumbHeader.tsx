import React, { FC } from 'react'

import { useRouter } from 'next/navigation'

import { OnboardButton } from '@banx/components/Buttons'

import { buildUrlWithModeAndToken, useTokenType } from '@banx/store'

import { FaqType } from '../Faq'
import { OnboardingModalContentType } from '../modals'

import styles from './BreadcrumbHeader.module.scss'

type Breadcrumb = {
  title: string
  path?: string
}

interface BreadcrumbHeaderProps {
  breadcrumbs: Breadcrumb[]
  onboardContentType?: `${OnboardingModalContentType}`
  faqType?: `${FaqType}`
}

export const BreadcrumbHeader: FC<BreadcrumbHeaderProps> = ({
  breadcrumbs,
  onboardContentType,
  faqType,
}) => {
  const router = useRouter()
  const { tokenType } = useTokenType()

  const handleNavigate = (path: string) => {
    router.push(buildUrlWithModeAndToken(path, tokenType))
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.navigation}>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {breadcrumb.path ? (
                <span
                  onClick={() => handleNavigate(breadcrumb.path!)}
                  className={styles.clickableBreadcrumb}
                >
                  {breadcrumb.title}
                </span>
              ) : (
                <span className={styles.currentBreadcrumb}>{breadcrumb.title}</span>
              )}
              {index < breadcrumbs.length - 1 && <span className={styles.arrow}>→</span>}
            </React.Fragment>
          ))}
        </div>

        {onboardContentType && <OnboardButton contentType={onboardContentType} faqType={faqType} />}
      </div>
    </div>
  )
}
