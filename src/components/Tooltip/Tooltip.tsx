import { FC, ReactNode } from 'react'

import { Tooltip as MantineTooltip, TooltipProps as MantineTooltipProps } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

export type TooltipProps = Omit<MantineTooltipProps, 'children'> & {
  children?: ReactNode
}

export const Tooltip: FC<TooltipProps> = ({
  label,
  children = null,
  position = 'bottom',
  ...rest
}) => {
  const fallback = <IconInfoCircle size={16} color="var(--content-secondary)" />

  if (label === undefined || label === null) {
    return <>{children || fallback}</>
  }

  return (
    <MantineTooltip
      {...rest}
      label={label}
      position={position}
      events={{ hover: true, focus: true, touch: true }}
    >
      <span style={{ display: 'inline-flex' }}>{children || fallback}</span>
    </MantineTooltip>
  )
}

export default Tooltip
