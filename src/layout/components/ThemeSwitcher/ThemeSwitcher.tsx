import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { Theme, useTheme } from '@banx/hooks'
import { Moon, Sun } from '@banx/icons'

import styles from './ThemeSwitcher.module.scss'

interface ThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.switcher}>
      <Button
        className={classNames(styles.button, className, {
          [styles.active]: theme === Theme.LIGHT,
        })}
        type="circle"
        variant="tertiary"
        onClick={() => theme !== Theme.LIGHT && toggleTheme()}
      >
        <Sun />
        <span>Light</span>
      </Button>
      <Button
        className={classNames(styles.button, className, {
          [styles.active]: theme === Theme.DARK,
        })}
        type="circle"
        variant="tertiary"
        onClick={() => theme !== Theme.DARK && toggleTheme()}
      >
        <Moon />
        <span>Dark</span>
      </Button>
    </div>
  )
}

export default ThemeSwitcher
