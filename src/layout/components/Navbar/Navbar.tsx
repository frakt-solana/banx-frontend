import { FC, Fragment } from 'react'

import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { TooltipWrapper } from '@banx/components/Tooltip'

import { ChevronDown } from '@banx/icons'
import { buildUrlWithModeAndToken, useTokenType } from '@banx/store'

import { NavigationLink, TOKEN_NAVIGATION_LINKS } from './constants'
import { isPathActive } from './helpers'

import styles from './Navbar.module.scss'

export const Navbar = () => {
  const { tokenType } = useTokenType()

  const createNewPath = (pathname: string) => {
    return buildUrlWithModeAndToken(pathname, tokenType)
  }

  return (
    <div className={styles.navbar}>
      {TOKEN_NAVIGATION_LINKS.map((link) => (
        <Fragment key={link.label}>
          {link.subLinks && (
            <DropdownLink key={link.label} link={link} createNewPath={createNewPath} />
          )}
          {!link.subLinks && (
            <NavbarLink key={link.label} link={link} createNewPath={createNewPath} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

interface NavbarLinkProps {
  link: NavigationLink
  createNewPath: (path: string) => string
}

const NavbarLink: FC<NavbarLinkProps> = ({ link, createNewPath }) => {
  const pathname = usePathname()
  const isActive = isPathActive(pathname, link.pathname, true)

  return (
    <TooltipWrapper title={link.disabledText}>
      <Link
        href={createNewPath(link.pathname)}
        className={classNames(styles.linkText, styles.navbarLink, {
          [styles.active]: isActive,
          [styles.disabled]: link.disabledText,
        })}
      >
        <span className={classNames(styles.linkText, { [styles.disabled]: link.disabledText })}>
          {link.label}
        </span>
      </Link>
    </TooltipWrapper>
  )
}

interface DropdownLinkProps {
  link: NavigationLink
  createNewPath: (path: string) => string
}

const DropdownLink: FC<DropdownLinkProps> = ({ link, createNewPath }) => {
  const pathname = usePathname()

  const isGroupActive =
    isPathActive(pathname, link.pathname, true) ||
    link.subLinks?.some((subLink) => isPathActive(pathname, subLink.pathname, true))

  return (
    <div
      className={classNames(styles.navbarLink, styles.dropdown, { [styles.active]: isGroupActive })}
    >
      <div className={styles.dropdownLabelWrapper}>
        <span className={styles.dropdownLabel}>{link.label}</span>
        <ChevronDown className={styles.dropdownChevron} />
      </div>
      <div className={styles.dropdownContent}>
        {link.subLinks!.map((child) => (
          <Link
            key={child.label}
            href={createNewPath(child.pathname)}
            className={classNames(styles.dropdownLink, {
              [styles.active]: isPathActive(pathname, child.pathname, true),
            })}
          >
            <div className={styles.dropdownLinkContent}>
              <span className={styles.dropdownLinkText}>{child.label}</span>
              <span className={styles.dropdownLinkDescription}>{child.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
