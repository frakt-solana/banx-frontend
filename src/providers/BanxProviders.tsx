'use client'

import { ReactNode } from 'react'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import { ErrorBoundary } from '@banx/components/ErrorBoundary'

import { DialectProvider } from './dialect'
import { QueryProvider } from './query'
import { SolanaConnectionWalletProvider } from './solana'

import '@mantine/carousel/styles.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

export function BanxProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
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
