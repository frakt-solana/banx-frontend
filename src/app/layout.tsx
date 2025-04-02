import { ReactNode } from 'react'

import { AppLayout } from '@banx/layout'
import { QueryProvider } from '@banx/providers/query'
import { SolanaConnectionWalletProvider } from '@banx/providers/solana'

import { GlobalStyles } from './global-styles'

export const metadata = {
  title: 'Banx Frontend',
  description: 'Next.js rewrite of Banx UI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalStyles />
        <QueryProvider>
          <SolanaConnectionWalletProvider>
            <AppLayout>{children}</AppLayout>
          </SolanaConnectionWalletProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
