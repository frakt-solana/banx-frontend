'use client'

import { ReactNode } from 'react'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { GlobalThemeStyles } from '@banx/scss/global'

import { DialectProvider } from './dialect'
import { QueryProvider } from './query'
import { SolanaConnectionWalletProvider } from './solana'

export function BanxProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
      <GlobalThemeStyles />
      <Notifications />
      <ErrorBoundary>
        <QueryProvider>
          <SolanaConnectionWalletProvider>
            <DialectProvider>{children}</DialectProvider>
          </SolanaConnectionWalletProvider>
        </QueryProvider>
      </ErrorBoundary>
      <GlobalThemeStyles />
    </MantineProvider>
  )
}
