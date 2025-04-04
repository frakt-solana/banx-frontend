import { Syne, Wix_Madefor_Display } from 'next/font/google'

export const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export const wix = Wix_Madefor_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-wix',
  display: 'swap',
})
