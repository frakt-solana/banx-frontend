import { SolanaConnectionWalletProvider } from '@banx/providers/solana'
import { QueryProvider } from '@banx/providers/query'

export const metadata = {
  title: 'Banx Frontend',
  description: 'Next.js rewrite of Banx UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <SolanaConnectionWalletProvider>{children}</SolanaConnectionWalletProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
