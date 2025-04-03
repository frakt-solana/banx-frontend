import React, { FC } from 'react'

import Link from 'next/link'

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
  const { tokenType } = useTokenType()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.navigation}>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {breadcrumb.path ? (
                <Link
                  href={buildUrlWithModeAndToken(breadcrumb.path, tokenType)}
                  className={styles.clickableBreadcrumb}
                >
                  {breadcrumb.title}
                </Link>
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
