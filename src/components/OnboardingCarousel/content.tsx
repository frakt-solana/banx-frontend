import { ResponsiveImage } from '../ResponsiveImage'
import borrowImage1 from './assets/borrow1.png'
import borrowImg1_dark from './assets/borrow1_dark.png'
import borrowImage2 from './assets/borrow2.png'
import borrowImg2_dark from './assets/borrow2_dark.png'
import borrowImage3 from './assets/borrow3.png'
import borrowImg3_dark from './assets/borrow3_dark.png'
import lend1 from './assets/lend1.png'
import lend1Dark from './assets/lend1_dark.png'
import lend2 from './assets/lend2.png'
import lend2Dark from './assets/lend2_dark.png'
import multiplyImage1 from './assets/multiply1.png'
import multiplyImage1Dark from './assets/multiply1_dark.png'
import { OnboardingContentType } from './types'

import styles from './OnboardingCarousel.module.scss'

const MULTIPLY_CONTENT = {
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={multiplyImage1.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={multiplyImage1Dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Farm apy and extra rewards</h3>
          <p>Multiply your assets and earn boosted yield and rewards</p>
        </div>
      ),
    },
  ],
}

const LEND_TOKEN_CONTENT = {
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={lend1.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={lend1Dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Vaults</h3>
          <p>
            Deposit funds into safe, curated strategies and earn passive income without managing
            risks yourself
          </p>
        </div>
      ),
    },
    {
      img: <ResponsiveImage className={styles.slideImg} src={lend2.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={lend2Dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Place offer</h3>
          <p>Create a custom offer, select your own interest rate, and lend on your terms</p>
        </div>
      ),
    },
    {
      img: <ResponsiveImage className={styles.slideImg} src={borrowImage1.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={borrowImg1_dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Loans market</h3>
          <p>Fund loans listed by other lenders and borrowers with terms already determined</p>
        </div>
      ),
    },
  ],
}

const BORROW_TOKEN_CONTENT = {
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={borrowImage1.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={borrowImg1_dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Banx loans are perpetual</h3>
          <p>
            They have no expiry, no fixed duration. As the borrower, you can repay and exit anytime
          </p>
        </div>
      ),
    },
    {
      img: <ResponsiveImage className={styles.slideImg} src={borrowImage2.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={borrowImg2_dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Interest rates</h3>
          <p>
            They are set once you borrow and accrued only for the time you borrow. Typically, low
            LTV loans are the safest way to borrow, benefiting from lower interest and lower
            refinancing call risk
          </p>
        </div>
      ),
    },
    {
      img: <ResponsiveImage className={styles.slideImg} src={borrowImage3.src} />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={borrowImg3_dark.src} />,
      text: (
        <div className={styles.slideText}>
          <h3>Loan status</h3>
          <p>
            Will be changed from Active to Terminating if you receive a refinancing call. You will
            have 72 hours to extend to a new offer or repay in full, otherwise your collateral will
            be liquidated
          </p>
        </div>
      ),
    },
  ],
}

export const CONTENT: Record<OnboardingContentType, typeof MULTIPLY_CONTENT> = {
  [OnboardingContentType.Multiply]: MULTIPLY_CONTENT,
  [OnboardingContentType.LendToken]: LEND_TOKEN_CONTENT,
  [OnboardingContentType.BorrowToken]: BORROW_TOKEN_CONTENT,
}
