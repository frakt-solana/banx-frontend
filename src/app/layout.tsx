import { ReactNode } from 'react'

import { AppLayout } from '@banx/layout'
import { DialectProvider } from '@banx/providers/dialect'
import { QueryProvider } from '@banx/providers/query'
import { SolanaConnectionWalletProvider } from '@banx/providers/solana'
import '@banx/scss/index.scss'

export const metadata = {
  title: 'Banx Frontend',
  description: 'Next.js rewrite of Banx UI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <SolanaConnectionWalletProvider>
            <DialectProvider>
              <AppLayout>{children}</AppLayout>
            </DialectProvider>
          </SolanaConnectionWalletProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
