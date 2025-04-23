import { CSSObject, Global } from '@emotion/react'

export const skeletonGlobalStyles: CSSObject = {
  '.mantine-Skeleton-root': {
    backgroundColor: 'var(--action-tertiary)',

    '&::before, &::after': {
      backgroundColor: 'var(--action-tertiary)',
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

export const snackbarGlobalStyles: CSSObject = {
  '.mantine-Notification-root': {
    background: 'var(--bg-tertiary)',
    border: '1px solid',
    borderRadius: 6,
    padding: 0,

    '&::before': {
      display: 'none',
    },
  },

  '.mantine-Notification-body': {
    margin: 0,
  },

  '.mantine-Notification-title': {
    color: 'var(--content-primary)',
    font: 'var(--body-text-md)',
    padding: '12px 12px 0 12px',
    marginBottom: 16,
  },

  '.mantine-Notification-description': {
    color: 'var(--content-secondary)',
    font: 'var(--body-text-sm)',
  },

  '.mantine-Notification-closeButton': {
    position: 'absolute',
    top: 8,
    right: 8,

    '&:hover': {
      color: 'inherit',
      backgroundColor: 'inherit',
    },

    svg: {
      width: '20px',
      height: '20px',
    },

    'svg rect': {
      fill: 'var(--content-primary)',
    },
  },

  '.mantine-Notification-icon': {
    width: 16,
    height: 16,
  },

  '.mantine-Notification-loader': {
    width: 16,
    height: 16,
  },
}

export const globalStyles: CSSObject = {
  ...skeletonGlobalStyles,
  ...tooltipGlobalStyles,
  ...modalGlobalStyles,
  ...snackbarGlobalStyles,
}

export const GlobalThemeStyles = () => <Global styles={globalStyles} />
