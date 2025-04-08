import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import ThemeSwitcher from '@banx/layout/components/ThemeSwitcher'
import { PriorityLevel, useModal, usePriorityFees, useSlippage } from '@banx/store'
import { enqueueSnackbar } from '@banx/utils/snackbar'

import { PRIORITY_TYPED_TABS, SLIPPAGE_TABS } from './constants'

import styles from './AppSettingsModal.module.scss'

export const AppSettingsModal = () => {
  const { close: closeModal } = useModal()

  const { priorityLevel, setPriorityLevel } = usePriorityFees()
  const priorityTabsValues = useTabs({
    tabs: PRIORITY_TYPED_TABS,
    defaultValue:
      PRIORITY_TYPED_TABS.find(({ value }) => value === priorityLevel)?.value ??
      PRIORITY_TYPED_TABS[0].value,
  })

  const { slippage, setSlippage } = useSlippage()
  const slippageTabsValues = useTabs({
    tabs: SLIPPAGE_TABS,
    defaultValue:
      SLIPPAGE_TABS.find(({ value }) => parseFloat(value) === slippage)?.value ??
      SLIPPAGE_TABS[0].value,
  })

  const onSaveChanges = () => {
    setPriorityLevel(priorityTabsValues.value as PriorityLevel)
    setSlippage(parseFloat(slippageTabsValues.value))
    enqueueSnackbar({
      message: 'Changes applied',
      type: 'success',
      autoHideDuration: 1.5,
    })
    closeModal()
  }

  return (
    <Modal open onCancel={closeModal} width={500}>
      <h2 className={styles.title}>Settings</h2>
      <TabsContent {...slippageTabsValues} title="Max slippage" />
      <TabsContent {...priorityTabsValues} title="Priority mode" />
      <ThemeContent />

      <Button className={styles.saveButton} onClick={onSaveChanges}>
        Save changes
      </Button>
    </Modal>
  )
}

type TabsContentProps = { title: string } & ReturnType<typeof useTabs>

const TabsContent: FC<TabsContentProps> = ({ title, value, tabs, setValue }) => {
  return (
    <>
      <h5 className={styles.subtitle}>{title}</h5>
      <div className={styles.tabs}>
        {tabs.map(({ label, value: tabValue, disabled }) => {
          const isActive = tabValue === value

          return (
            <button
              key={tabValue}
              className={classNames(styles.tab, { [styles.tabActive]: isActive })}
              name={tabValue}
              onClick={() => {
                setValue(tabValue)
              }}
              disabled={disabled}
            >
              {label}
            </button>
          )
        })}
      </div>
    </>
  )
}

const ThemeContent = () => {
  return (
    <div className={styles.themeContent}>
      <h5 className={styles.subtitle}>Theme</h5>
      <ThemeSwitcher />
    </div>
  )
}
