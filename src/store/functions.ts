import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import { useSearchParams } from 'next/navigation'
import { create } from 'zustand'

import { TICKER_TO_TOKEN, TOKEN_TICKER } from '@banx/utils'

export const buildUrlWithModeAndToken = (
  pathname: string,
  tokenType: LendingTokenType | null,
): string => {
  const urlParams = new URLSearchParams()

  if (tokenType) {
    urlParams.set('token', TOKEN_TICKER[tokenType])
  }

  return `${pathname}?${urlParams.toString()}`
}

const getUrlParam = (
  params: URLSearchParams | ReturnType<typeof useSearchParams>,
  key: string,
): string | null => {
  return typeof params.get === 'function' ? params.get(key) : null
}

export const getTokenTypeFromUrl = (params: URLSearchParams): LendingTokenType => {
  const tokenTicker = getUrlParam(params, 'token')

  if (tokenTicker && TICKER_TO_TOKEN[tokenTicker]) {
    return TICKER_TO_TOKEN[tokenTicker]
  }
  return LendingTokenType.Usdc
}

type State<T> = {
  value: T
  setValue: (newValue: T | ((prevValue: T) => T)) => void
}

export const createGlobalState = <T>(defaultValue?: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useStore = create<State<any>>((set) => ({
    value: defaultValue ?? undefined,
    setValue: (newValue: T | ((prevValue: T) => T)) =>
      set((state) => ({
        value: _.isFunction(newValue) ? (newValue as (prevValue: T) => T)(state.value) : newValue,
      })),
  }))

  return () => {
    const state = useStore((state) => state.value)
    const setState = useStore((state) => state.setValue)

    return [state, setState] as [State<T>['value'], State<T>['setValue']]
  }
}
