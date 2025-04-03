'use client'

import { FC, PropsWithChildren, ReactNode, useRef, useState } from 'react'

import classNames from 'classnames'

import { useOnClickOutside } from '@banx/hooks'

import { Button } from '../Buttons'

import styles from './Dropdowns.module.scss'

interface BackdropDropdownProps {
  className?: string
  buttonContent?: (isDropdownOpen: boolean) => ReactNode
  closeOnOutsideClick?: boolean // Optional prop for closing on outside click
}

const BackdropDropdown: FC<PropsWithChildren<BackdropDropdownProps>> = ({
  children,
  className,
  buttonContent,
  closeOnOutsideClick = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => {
    if (closeOnOutsideClick && isDropdownOpen) {
      setIsDropdownOpen(false)
    }
  })

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  const isSmall = className?.includes('small')

  return (
    <>
      <div
        onClick={toggleDropdown}
        className={classNames(styles.overlay, { [styles.visible]: isDropdownOpen })}
      />
      <div className={classNames(styles.container, className)} ref={dropdownRef}>
        <Button
          type="circle"
          variant="tertiary"
          className={classNames(styles.dropdownButton, {
            [styles.isOpen]: isDropdownOpen,
            [styles.small]: isSmall,
          })}
          onClick={toggleDropdown}
        >
          {buttonContent && buttonContent(isDropdownOpen)}
        </Button>

        {isDropdownOpen ? (
          <div className={classNames(styles.dropdown, { [styles.small]: isSmall })}>{children}</div>
        ) : null}
      </div>
    </>
  )
}

export default BackdropDropdown
