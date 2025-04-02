'use client'

import { useEffect } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { create } from 'zustand'

import { buildUrlWithModeAndToken, getAssetModeFromUrl } from './functions'

export enum AssetMode {
  NFT = 'nft',
  Token = 'token',
}

interface ModeContext {
  currentAssetMode: AssetMode
  setAssetMode: (newMode: AssetMode) => void
}

const useAssetModeState = create<ModeContext>((set) => ({
  currentAssetMode: AssetMode.Token,
  setAssetMode: (newMode) => set({ currentAssetMode: newMode }),
}))

export const useAssetMode = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const assetModeFromUrl = getAssetModeFromUrl(searchParams)
  const { currentAssetMode, setAssetMode } = useAssetModeState()

  useEffect(() => {
    if (currentAssetMode !== assetModeFromUrl) {
      setAssetMode(assetModeFromUrl)
    }
  }, [assetModeFromUrl, currentAssetMode, setAssetMode])

  const changeAssetMode = (newMode: AssetMode) => {
    if (newMode !== currentAssetMode) {
      const updatedUrl = buildUrlWithModeAndToken(pathname, newMode, null)
      setAssetMode(newMode)
      router.replace(updatedUrl)
    }
  }

  return {
    currentAssetMode,
    changeAssetMode,
  }
}
