import { FC, Fragment } from 'react'

import classNames from 'classnames'
import Link from 'next/link'

import { TooltipWrapper } from '@banx/components/Tooltip'

import { ChevronDown } from '@banx/icons'
import { AssetMode, buildUrlWithModeAndToken, useAssetMode, useTokenType } from '@banx/store'

import { NFT_NAVIGATION_LINKS, NavigationLink, TOKEN_NAVIGATION_LINKS } from './constants'
import { isActivePath, isLinkOrSubLinkActive } from './helpers'

import styles from './Navbar.module.scss'

export const Navbar = () => {
  const { currentAssetMode } = useAssetMode()
  const { tokenType } = useTokenType()

  const linksToRender =
    currentAssetMode === AssetMode.Token ? TOKEN_NAVIGATION_LINKS : NFT_NAVIGATION_LINKS

  const createNewPath = (pathname: string) => {
    return buildUrlWithModeAndToken(pathname, currentAssetMode, tokenType)
  }

  return (
    <div className={styles.navbar}>
      {linksToRender.map((link) => (
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
  return (
    <TooltipWrapper title={link.disabledText}>
      <Link
        href={createNewPath(link.pathname)}
        className={classNames(styles.linkText, styles.navbarLink, {
          [styles.active]: isActivePath(link.pathname, true),
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
  return (
    <div
      className={classNames(styles.navbarLink, styles.dropdown, {
        [styles.active]: isLinkOrSubLinkActive(link.pathname, link.subLinks),
      })}
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
              [styles.active]: isActivePath(child.pathname, true),
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
