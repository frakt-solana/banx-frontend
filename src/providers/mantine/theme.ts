import styles from './theme.module.scss'

export const tooltipStyles = {
  styles: {
    tooltip: {
      backgroundColor: 'var(--pure-black)',
      borderRadius: 4,
      color: 'var(--pure-white)',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      maxWidth: 320,
    },
  },
}

export const modalStyles = {
  styles: {
    modal: {
      background: 'var(--bg-tertiary)',
      borderRadius: 6,
      color: 'var(--content-primary)',
    },
  },
}

export const skeletonStyles = {
  classNames: {
    root: styles.skeleton,
  },
}

export const mantineTheme = {
  components: {
    Tooltip: tooltipStyles,
    Modal: modalStyles,
    Skeleton: skeletonStyles,
  },
}
