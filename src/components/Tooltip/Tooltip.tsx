import { FC, PropsWithChildren } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd'
import { TooltipPropsWithTitle } from 'antd/es/tooltip'

import styles from './Tooltip.module.scss'

const Tooltip: FC<PropsWithChildren<AntdTooltipProps>> = ({
  children,
  placement = 'bottom',
  ...props
}) => (
  <AntdTooltip {...props} arrowContent={null} placement={placement}>
    {children || <InfoCircleOutlined className={styles.icon} />}
  </AntdTooltip>
)

export default Tooltip

export const TooltipWrapper: FC<PropsWithChildren<TooltipPropsWithTitle>> = ({
  title,
  className,
  children,
  ...props
}) => (
  <Tooltip className={className || styles.tooltip} title={title} {...props}>
    <>{children}</>
  </Tooltip>
)
