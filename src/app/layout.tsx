import { ReactNode } from 'react'

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { AppLayout } from '@banx/layout'
import { DialectProvider } from '@banx/providers/dialect'
import { QueryProvider } from '@banx/providers/query'
import { SnackbarProvider } from '@banx/providers/snackbar'
import { SolanaConnectionWalletProvider } from '@banx/providers/solana'
import '@banx/scss/index.scss'

import { syne, wix } from './fonts'

import '@mantine/core/styles.css'

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
    <html lang="en" className={`${syne.variable} ${wix.variable}`} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <ErrorBoundary>
            <QueryProvider>
              <SolanaConnectionWalletProvider>
                <DialectProvider>
                  <SnackbarProvider>
                    <AppLayout>{children}</AppLayout>
                  </SnackbarProvider>
                </DialectProvider>
              </SolanaConnectionWalletProvider>
            </QueryProvider>
          </ErrorBoundary>
        </MantineProvider>
      </body>
    </html>
  )
}
