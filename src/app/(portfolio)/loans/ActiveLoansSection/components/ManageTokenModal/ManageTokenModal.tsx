import { FC } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { TokenLoan } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { RepayTokenContent } from './RepayTokenContent'
import SupplyCollateralContent from './SupplyCollateralContent'

import styles from './ManageTokenModal.module.scss'

interface ManageTokenModalProps {
  loan: TokenLoan
}

export const ManageTokenModal: FC<ManageTokenModalProps> = ({ loan }) => {
  const { close: closeModal } = useModal()

  const {
    value: currentTabValue,
    setValue,
    tabs,
  } = useTabs({ tabs: TABS, defaultValue: TabName.Repay })

  return (
    <Modal open onCancel={closeModal} className={styles.modal}>
      <Tabs value={currentTabValue} tabs={tabs} setValue={setValue} className={styles.tabs} />
      <div className={styles.modalContent}>
        {currentTabValue === TabName.Repay && <RepayTokenContent loan={loan} />}
        {currentTabValue === TabName.Supply && <SupplyCollateralContent loan={loan} />}
      </div>
    </Modal>
  )
}

export default ManageTokenModal

enum TabName {
  Repay = 'repay',
  Supply = 'request',
}

const TABS = [
  {
    label: 'Repay',
    value: TabName.Repay,
  },
  {
    label: 'Add collateral',
    value: TabName.Supply,
  },
]
