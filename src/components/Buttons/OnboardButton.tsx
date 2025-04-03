import { FC } from 'react'

import { OnboardingModal, OnboardingModalContentType } from '@banx/components/modals'

import { Info } from '@banx/icons'
import { useModal } from '@banx/store'

import { FaqType } from '../Faq'

import styles from './Buttons.module.scss'

interface OnboardButtonProps {
  contentType: `${OnboardingModalContentType}`
  faqType?: `${FaqType}`
  title?: string
}

export const OnboardButton: FC<OnboardButtonProps> = ({ contentType, faqType }) => {
  const { open, close } = useModal()

  const openModal = () => {
    open(OnboardingModal, { contentType, faqType, onCancel: close })
  }

  return (
    <div className={styles.onboardBtn} onClick={openModal}>
      <Info />
    </div>
  )
}
