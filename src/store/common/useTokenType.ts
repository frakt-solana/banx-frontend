import { useEffect } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { create } from 'zustand'

import { buildUrlWithModeAndToken, getTokenTypeFromUrl } from '../functions'

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

  const tokenTypeFromUrl = getTokenTypeFromUrl(searchParams)

  const { currentTokenType, setTokenType } = useTokenTypeState()

  useEffect(() => {
    if (currentTokenType !== tokenTypeFromUrl) {
      setTokenType(tokenTypeFromUrl)
    }
  }, [tokenTypeFromUrl, currentTokenType, setTokenType])

  const changeTokenType = (newTokenType: LendingTokenType) => {
    if (newTokenType !== currentTokenType) {
      const newUrl = buildUrlWithModeAndToken(pathname, newTokenType)
      setTokenType(newTokenType)
      router.replace(newUrl)
    }
  }

  return {
    tokenType: currentTokenType,
    setTokenType: changeTokenType,
  }
}
