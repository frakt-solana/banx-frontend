import { FC } from 'react'

import classNames from 'classnames'

import { WalletAvatar } from '@banx/icons'

import { ResponsiveImage } from '../ResponsiveImage'

import styles from './UserAvatar.module.scss'

interface UserAvatarProps {
  imageUrl?: string
  className?: string
}

const UserAvatar: FC<UserAvatarProps> = ({ imageUrl, className }) => {
  const avatar = imageUrl ? <ResponsiveImage src={imageUrl} alt="user avatar" /> : <WalletAvatar />

  return <div className={classNames(styles.avatar, className)}>{avatar}</div>
}

export default UserAvatar
