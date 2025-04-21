import { CSSObject, Global } from '@emotion/react'

export const skeletonGlobalStyles: CSSObject = {
  '.mantine-Skeleton-root': {
    backgroundColor: 'var(--action-secondary)',

    '&::before, &::after': {
      backgroundColor: 'var(--action-primary)',
    },
  },
}

export const tooltipGlobalStyles: CSSObject = {
  '.mantine-Tooltip-tooltip': {
    backgroundColor: 'var(--pure-black)',
    borderRadius: 4,
    color: 'var(--pure-white)',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    maxWidth: 320,
  },
}

export const modalGlobalStyles: CSSObject = {
  '.mantine-Modal-content': {
    background: 'var(--bg-tertiary)',
    borderRadius: 6,
    color: 'var(--content-primary)',
  },
}

export const globalStyles: CSSObject = {
  ...skeletonGlobalStyles,
  ...tooltipGlobalStyles,
  ...modalGlobalStyles,
}

export const GlobalThemeStyles = () => <Global styles={globalStyles} />
