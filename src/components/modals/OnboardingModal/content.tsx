import { ResponsiveImage } from '@banx/components/ResponsiveImage'

import borrowImg from './assets/borrow.png'
import borrowImg_dark from './assets/borrow_dark.png'
import loansImg from './assets/loans.png'
import loansMarketImg from './assets/loansMarket.png'
import loansMarketImg_dark from './assets/loansMarket_dark.png'
import loansImg_dark from './assets/loans_dark.png'
import multiplyImg from './assets/multiply.png'
import multiplyAdraImg from './assets/multiplyAdra.png'
import multiplyAdraImg_dark from './assets/multiplyAdra_dark.png'
import multiplyFragImg from './assets/multiplyFrag.png'
import multiplyFragImg_dark from './assets/multiplyFrag_dark.png'
import multiplyHubImg from './assets/multiplyHub.png'
import multiplyHubImg_dark from './assets/multiplyHub_dark.png'
import multiplyJlpImg from './assets/multiplyJlp.png'
import multiplyJlpImg_dark from './assets/multiplyJlp_dark.png'
import multiplyLrtsImg from './assets/multiplyLrts.png'
import multiplyLrtsImg_dark from './assets/multiplyLrts_dark.png'
import multiplyVsolImg from './assets/multiplyVsol.png'
import multiplyVsolImg_dark from './assets/multiplyVsol_dark.png'
import multiplyImg_dark from './assets/multiply_dark.png'
import offersImg from './assets/offers.png'
import offersImg_dark from './assets/offers_dark.png'
import placeOfferImg from './assets/placeOffer.png'
import placeOfferImg_dark from './assets/placeOffer_dark.png'
import vaultsImg from './assets/vaults.png'
import vaultsImg_dark from './assets/vaults_dark.png'
import { OnboardingModalContentType } from './types'

import styles from './OnboardingModal.module.scss'

const MULTIPLY_CONTENT = {
  title: 'Multiply',
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={multiplyImg.src} alt="multiply" />,
      imgDark: (
        <ResponsiveImage className={styles.slideImg} src={multiplyImg_dark.src} alt="multiply" />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_LRTS_CONTENT = {
  title: 'Multiply: lrtssol',
  slides: [
    {
      img: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyLrtsImg.src}
          alt="multiply lrtssol"
        />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyLrtsImg_dark.src}
          alt="multiply lrtssol"
        />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_JLP_CONTENT = {
  title: 'Multiply: JLP',
  slides: [
    {
      img: (
        <ResponsiveImage className={styles.slideImg} src={multiplyJlpImg.src} alt="multiply jlp" />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyJlpImg_dark.src}
          alt="multiply jlp"
        />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_HUBSOL_CONTENT = {
  title: 'Multiply: Hubsol',
  slides: [
    {
      img: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyHubImg.src}
          alt="multiply hubsol"
        />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyHubImg_dark.src}
          alt="multiply hubsol"
        />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_ADRASOL_CONTENT = {
  title: 'Multiply: adraSOL',
  slides: [
    {
      img: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyAdraImg.src}
          alt="multiply adraSOL"
        />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyAdraImg_dark.src}
          alt="multiply adraSOL"
        />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_VSOL_CONTENT = {
  title: 'Multiply: vSOL',
  slides: [
    {
      img: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyVsolImg.src}
          alt="multiply vSOL"
        />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyVsolImg_dark.src}
          alt="multiply vSOL"
        />
      ),
      text: null,
    },
  ],
}

const MULTIPLY_WFRAGSOL_CONTENT = {
  title: 'Multiply: Wrapped FragSOL',
  slides: [
    {
      img: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyFragImg.src}
          alt="multiply wrapped FragSOL"
        />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={multiplyFragImg_dark.src}
          alt="multiply wrapped FragSOL"
        />
      ),
      text: null,
    },
  ],
}

const BORROW_CONTENT = {
  title: 'Borrow',
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={borrowImg.src} alt="borrow" />,
      imgDark: (
        <ResponsiveImage className={styles.slideImg} src={borrowImg_dark.src} alt="borrow" />
      ),
      text: null,
    },
  ],
}

const VAULTS_CONTENT = {
  title: 'Vaults',
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={vaultsImg.src} alt="vaults" />,
      imgDark: (
        <ResponsiveImage className={styles.slideImg} src={vaultsImg_dark.src} alt="vaults" />
      ),
      text: null,
    },
  ],
}

const PLACE_OFFER = {
  title: 'Place offer',
  slides: [
    {
      img: (
        <ResponsiveImage className={styles.slideImg} src={placeOfferImg.src} alt="place offer" />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={placeOfferImg_dark.src}
          alt="place offer"
        />
      ),
      text: null,
    },
  ],
}

const LOANS_MARKET = {
  title: 'Loans market',
  slides: [
    {
      img: (
        <ResponsiveImage className={styles.slideImg} src={loansMarketImg.src} alt="loans market" />
      ),
      imgDark: (
        <ResponsiveImage
          className={styles.slideImg}
          src={loansMarketImg_dark.src}
          alt="loans market"
        />
      ),
      text: null,
    },
  ],
}

const OFFERS_CONTENT = {
  title: 'My offers',
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={offersImg.src} alt="offers" />,
      imgDark: (
        <ResponsiveImage className={styles.slideImg} src={offersImg_dark.src} alt="offers" />
      ),
      text: null,
    },
  ],
}

const LOANS_CONTENT = {
  title: 'My loans',
  slides: [
    {
      img: <ResponsiveImage className={styles.slideImg} src={loansImg.src} alt="loans" />,
      imgDark: <ResponsiveImage className={styles.slideImg} src={loansImg_dark.src} alt="loans" />,
      text: null,
    },
  ],
}

export const CONTENT = {
  [OnboardingModalContentType.BORROW]: BORROW_CONTENT,
  [OnboardingModalContentType.MULTIPLY]: MULTIPLY_CONTENT,
  [OnboardingModalContentType.MULTIPLY_LRTS]: MULTIPLY_LRTS_CONTENT,
  [OnboardingModalContentType.MULTIPLY_JLP]: MULTIPLY_JLP_CONTENT,
  [OnboardingModalContentType.MULTIPLY_ADRASOL]: MULTIPLY_ADRASOL_CONTENT,
  [OnboardingModalContentType.MULTIPLY_VSOL]: MULTIPLY_VSOL_CONTENT,
  [OnboardingModalContentType.MULTIPLY_HUBSOL]: MULTIPLY_HUBSOL_CONTENT,
  [OnboardingModalContentType.MULTIPLY_WFRAGSOL]: MULTIPLY_WFRAGSOL_CONTENT,
  [OnboardingModalContentType.VAULTS]: VAULTS_CONTENT,
  [OnboardingModalContentType.PLACE_OFFER]: PLACE_OFFER,
  [OnboardingModalContentType.LOANS_MARKET]: LOANS_MARKET,
  [OnboardingModalContentType.OFFERS]: OFFERS_CONTENT,
  [OnboardingModalContentType.LOANS]: LOANS_CONTENT,
}
