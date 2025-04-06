import { ReactNode } from 'react'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { AppLayout } from '@banx/layout'
import { DialectProvider } from '@banx/providers/dialect'
import { QueryProvider } from '@banx/providers/query'
import { SolanaConnectionWalletProvider } from '@banx/providers/solana'
import '@banx/scss/index.scss'

import { syne, wix } from './fonts'

export const metadata = {
  title: 'Banx | Lend and Borrow against any asset on Solana 🫰 💰',
  description:
    'Borrow ● Lend ● Hedge ◎ Solana tokens and NFTs instantly with no expiration, no price liquidation',
  metadataBase: new URL('https://banx.gg'),
  openGraph: {
    title: 'Banx | Lend and Borrow against any asset on Solana 🫰 💰',
    description:
      'Borrow ● Lend ● Hedge ◎ Solana tokens and NFTs instantly with no expiration, no price liquidation',
    url: 'https://banx.gg',
    siteName: 'Banx',
    images: ['https://banx.gg/frakt.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Banx | Lend and Borrow against any asset on Solana 🫰 💰',
    description:
      'Borrow ● Lend ● Hedge ◎ Solana tokens and NFTs instantly with no expiration, no price liquidation',
    images: ['https://banx.gg/frakt.png'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${wix.variable}`}>
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <SolanaConnectionWalletProvider>
              <DialectProvider>
                <AppLayout>{children}</AppLayout>
              </DialectProvider>
            </SolanaConnectionWalletProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
