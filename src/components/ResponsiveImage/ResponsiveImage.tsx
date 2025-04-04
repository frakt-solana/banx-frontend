import { FC } from 'react'

import { ImageProps } from 'next/image'

type ResponsiveImageProps = Omit<ImageProps, 'width' | 'height' | 'fill' | 'alt'> & {
  className?: string
  alt?: string
}

export const ResponsiveImage: FC<ResponsiveImageProps> = ({ className, alt = '', ...props }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} className={className} alt={alt} />
}
