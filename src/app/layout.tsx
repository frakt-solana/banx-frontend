import '@banx/less/index.less'
import { QueryProvider } from '@banx/providers/query'
import { SolanaConnectionWalletProvider } from '@banx/providers/solana'

import { GlobalStyle } from './global-style'

export const metadata = {
  title: 'Banx Frontend',
  description: 'Next.js rewrite of Banx UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalStyle />
        <QueryProvider>
          <SolanaConnectionWalletProvider>{children}</SolanaConnectionWalletProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
