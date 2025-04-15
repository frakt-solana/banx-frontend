'use client'

import { ReactNode } from 'react'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { DialectProvider } from './dialect'
import { mantineTheme } from './mantine'
import { QueryProvider } from './query'
import { SolanaConnectionWalletProvider } from './solana'



export function BanxProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications />
      <ErrorBoundary>
        <QueryProvider>
          <SolanaConnectionWalletProvider>
            <DialectProvider>{children}</DialectProvider>
          </SolanaConnectionWalletProvider>
        </QueryProvider>
      </ErrorBoundary>
    </MantineProvider>
  )
}
