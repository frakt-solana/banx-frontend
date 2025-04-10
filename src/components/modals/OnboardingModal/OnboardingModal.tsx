import { FC } from 'react'

import { Carousel } from 'antd'
import classNames from 'classnames'

import Faq, { FaqType } from '@banx/components/Faq'
import { Loader } from '@banx/components/Loader'

import { Theme, useTheme } from '@banx/hooks'
import { ChevronDown } from '@banx/icons'

import { Modal } from '../BaseModal'
import { CONTENT } from './content'
import { OnboardingModalContentType } from './types'

import styles from './OnboardingModal.module.scss'

interface OnboardingModalProps {
  contentType?: `${OnboardingModalContentType}`
  faqType?: `${FaqType}`
  onCancel: () => void
}

export const OnboardingModal: FC<OnboardingModalProps> = ({
  contentType = 'borrow',
  faqType,
  onCancel,
}) => {
  const { theme } = useTheme()
  const isDarkMode = theme === Theme.DARK

  const content = CONTENT[contentType]

  return (
    <Modal opened onClose={onCancel} classNames={{ body: styles.modalBody }}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>{content.title}</h3>
        <Carousel
          draggable
          nextArrow={<ChevronDown className={styles.carouselArrow} />}
          prevArrow={<ChevronDown className={styles.carouselArrow} />}
          arrows
          infinite={false}
        >
          {content.slides.map(({ text, img, imgDark }, idx) => (
            <div className={classNames(styles.slide, { [styles.darkSlide]: isDarkMode })} key={idx}>
              {isDarkMode ? imgDark : img}
              {text}
            </div>
          ))}
        </Carousel>
        {faqType && <Faq type={faqType} className={styles.faqContainer} />}
      </div>
      <div className={styles.loaderWrapper}>
        <Loader size="large" />
      </div>
    </Modal>
  )
}
