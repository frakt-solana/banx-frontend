import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api'
import { useModal } from '@banx/store/common'
import { isTokenLoanTerminating } from '@banx/utils'

import { ClosureContent } from './ClosureContent'
import { RepaymentCallContent } from './RepaymentCallContent'

import styles from './ManageModal.module.scss'

interface ManageModalProps {
  loan: Loan
}

const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  const TABS: Tab[] = [
    {
      label: 'Repayment call',
      value: TabName.REPAYMENT,
      disabled: isTokenLoanTerminating(loan),
    },
    {
      label: 'Closure',
      value: TabName.CLOSURE,
    },
  ]

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.CLOSURE,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} value={currentTabValue} {...tabProps} />
      {currentTabValue === TabName.REPAYMENT && <RepaymentCallContent loan={loan} />}
      {currentTabValue === TabName.CLOSURE && <ClosureContent loan={loan} />}
    </Modal>
  )
}

export default ManageModal

enum TabName {
  REPAYMENT = 'repayment',
  CLOSURE = 'closure',
}
