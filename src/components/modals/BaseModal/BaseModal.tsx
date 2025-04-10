import { FC, PropsWithChildren } from 'react'

import { Modal as MantineModal, ModalProps as MantineModalProps } from '@mantine/core'

import { deepMergeStyles } from '@banx/utils/common'

import styles from './BaseModal.module.scss'

type ModalProps = PropsWithChildren<
  MantineModalProps & {
    opened: boolean
    onClose: () => void
    classNames?: MantineModalProps['classNames']
  }
>
export const Modal: FC<ModalProps> = ({ opened, onClose, children, classNames, ...rest }) => {
  const mergedClassNames = deepMergeStyles(
    {
      content: styles.modal,
    },
    classNames,
  )

  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      classNames={mergedClassNames}
      centered
      overlayProps={{ blur: 5 }}
      padding={0}
      closeOnClickOutside
      closeOnEscape
      {...rest}
    >
      {children}
    </MantineModal>
  )
}
