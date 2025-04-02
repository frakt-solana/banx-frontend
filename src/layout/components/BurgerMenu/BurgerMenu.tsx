'use client'

import { FC, useState } from 'react'

import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { TooltipWrapper } from '@banx/components/Tooltip'

import { Burger, BurgerClose, ChevronDown } from '@banx/icons'
import { AssetMode, buildUrlWithModeAndToken, useAssetMode, useTokenType } from '@banx/store'

import {
  NFT_NAVIGATION_LINKS,
  NavigationLink,
  SubNavigationLink,
  TOKEN_NAVIGATION_LINKS,
} from '../Navbar'
import { isActivePath, isLinkOrSubLinkActive } from '../Navbar/helpers'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.scss'

const BurgerMenu = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()
  const { currentAssetMode } = useAssetMode()
  const { tokenType } = useTokenType()

  const linksToRender =
    currentAssetMode === AssetMode.Token ? TOKEN_NAVIGATION_LINKS : NFT_NAVIGATION_LINKS

  const createNewPath = (pathname: string) => {
    return buildUrlWithModeAndToken(pathname, currentAssetMode, tokenType)
  }

  const [expandedLink, setExpandedLink] = useState<string | null>(null)

  const handleExpand = (label: string) => {
    setExpandedLink((prev) => (prev === label ? null : label))
  }

  const handleClose = () => {
    toggleVisibility()
    setExpandedLink(null)
  }

  return (
    <>
      <div
        onClick={toggleVisibility}
        className={classNames(styles.overlay, { [styles.visible]: isVisible })}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={classNames(styles.burgerMenu, { [styles.visible]: isVisible })}
      >
        {linksToRender.map((link) => (
          <MenuItem
            key={link.label}
            link={link}
            expandedLink={expandedLink}
            onExpand={handleExpand}
            createNewPath={createNewPath}
            closeMenu={handleClose}
          />
        ))}
      </div>
    </>
  )
}

export default BurgerMenu

interface MenuItemProps {
  link: NavigationLink
  expandedLink: string | null
  onExpand: (label: string) => void
  createNewPath: (pathname: string) => string
  closeMenu: () => void
}

const MenuItem: FC<MenuItemProps> = ({
  link,
  expandedLink,
  onExpand,
  createNewPath,
  closeMenu,
}) => {
  const router = useRouter()

  const { label, subLinks, pathname } = link
  const isExpanded = expandedLink === label

  const handleClick = () => {
    if (subLinks) {
      onExpand(label)
    } else {
      router.push(createNewPath(pathname))
      closeMenu()
    }
  }

  return (
    <TooltipWrapper title={link.disabledText}>
      <div
        onClick={handleClick}
        className={classNames(styles.menuItem, {
          [styles.active]: isExpanded || isLinkOrSubLinkActive(pathname, subLinks),
          [styles.disabled]: link.disabledText,
          [styles.expanded]: isExpanded,
        })}
      >
        <div
          className={classNames(styles.menuItemLabel, {
            [styles.expanded]: isExpanded,
            [styles.disabled]: link.disabledText,
          })}
        >
          {label}
          {subLinks && (
            <span className={classNames(styles.chevron, { [styles.expanded]: isExpanded })}>
              <ChevronDown />
            </span>
          )}
        </div>
        {subLinks && (
          <Dropdown
            subLinks={subLinks}
            createNewPath={createNewPath}
            closeMenu={closeMenu}
            isExpanded={isExpanded}
          />
        )}
      </div>
    </TooltipWrapper>
  )
}

interface DropdownProps {
  subLinks: SubNavigationLink[]
  createNewPath: (pathname: string) => string
  closeMenu: () => void
  isExpanded: boolean
}

const Dropdown: FC<DropdownProps> = ({ subLinks, createNewPath, closeMenu, isExpanded }) => (
  <div className={classNames(styles.dropdown, { [styles.expanded]: isExpanded })}>
    {subLinks.map((link) => (
      <Link
        key={link.label}
        onClick={closeMenu}
        href={createNewPath(link.pathname)}
        className={classNames(styles.dropdownItem, {
          [styles.active]: isActivePath(link.pathname, true),
        })}
      >
        <span className={styles.dropdownLink}>{link.label}</span>
        {link.description && (
          <span className={styles.dropdownLinkDescription}>{link.description}</span>
        )}
      </Link>
    ))}
  </div>
)

export const BurgerIcon = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <div onClick={toggleVisibility} className={styles.burgerIcon}>
      {isVisible ? <BurgerClose /> : <Burger />}
    </div>
  )
}
