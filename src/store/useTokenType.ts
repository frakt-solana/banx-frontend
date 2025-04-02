'use client'

import { useEffect } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { create } from 'zustand'

import { buildUrlWithModeAndToken, getAssetModeFromUrl, getTokenTypeFromUrl } from './functions'

type TokenTypeContext = {
  currentTokenType: LendingTokenType
  setTokenType: (newTokenType: LendingTokenType) => void
}

export const useTokenTypeState = create<TokenTypeContext>((set) => ({
  currentTokenType: LendingTokenType.BanxSol,
  setTokenType: (newTokenType) => set({ currentTokenType: newTokenType }),
}))

export const useTokenType = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const assetModeFromUrl = getAssetModeFromUrl(searchParams)
  const tokenTypeFromUrl = getTokenTypeFromUrl(searchParams, assetModeFromUrl)

  const { currentTokenType, setTokenType } = useTokenTypeState()

  useEffect(() => {
    if (currentTokenType !== tokenTypeFromUrl) {
      setTokenType(tokenTypeFromUrl)
    }
  }, [tokenTypeFromUrl, currentTokenType, setTokenType])

  const changeTokenType = (newTokenType: LendingTokenType) => {
    if (newTokenType !== currentTokenType) {
      const newUrl = buildUrlWithModeAndToken(pathname, assetModeFromUrl, newTokenType)
      setTokenType(newTokenType)
      router.replace(newUrl)
    }
  }

  return {
    tokenType: currentTokenType,
    setTokenType: changeTokenType,
  }
}
