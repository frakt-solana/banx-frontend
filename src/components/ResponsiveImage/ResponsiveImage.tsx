import { FC } from 'react'

import { ImageProps } from 'next/image'

type ResponsiveImageProps = Omit<ImageProps, 'width' | 'height' | 'fill' | 'alt'> & {
  className?: string
}

export const ResponsiveImage: FC<ResponsiveImageProps> = ({ className, ...props }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  return <img {...props} className={className} alt="image" />
}
