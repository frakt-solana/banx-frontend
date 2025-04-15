import type { MantineThemeComponents } from '@mantine/core'

export const tooltipStyles: MantineThemeComponents['Tooltip'] = {
  styles: () => ({
    tooltip: {
      backgroundColor: 'var(--pure-black)',
      borderRadius: 4,
      color: 'var(--pure-white)',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      maxWidth: 320,
    },
  }),
}
