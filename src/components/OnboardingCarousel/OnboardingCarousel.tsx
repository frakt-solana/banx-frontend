import { FC } from 'react'

import { Carousel } from '@mantine/carousel'

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
        <Carousel withControls={false}>
          {content.slides.map(({ text, img, imgDark }, idx) => (
            <Carousel.Slide key={idx} className={styles.carouselSlide}>
              {isDarkMode ? imgDark : img}
              {text}
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </div>
  )
}
