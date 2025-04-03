import { FC } from 'react'

import { Carousel } from 'antd'

import { Theme, useTheme } from '@banx/hooks'

import { CONTENT } from './content'
import { OnboardingContentType } from './types'

import styles from './OnboardingCarousel.module.scss'

interface OnboardingCarouselProps {
  contentType: `${OnboardingContentType}`
}

export const OnboardingCarousel: FC<OnboardingCarouselProps> = ({ contentType }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === Theme.DARK

  const content = CONTENT[contentType]

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselContent}>
        <Carousel draggable infinite={false}>
          {content.slides.map(({ text, img, imgDark }, idx) => (
            <div key={idx} className={styles.carouselSlide}>
              {isDarkMode ? imgDark : img}
              {text}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}
