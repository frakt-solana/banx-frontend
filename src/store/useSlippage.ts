import { z } from 'zod'
import { create } from 'zustand'

const BANX_SLIPPAGE_STATE_LS_KEY = '@banx.slippageState'

export const SLIPPAGE_VALUES = [1, 2, 3, 5] as const //%

const DEFAULT_SLIPPAGE = SLIPPAGE_VALUES[2]

type SlippageState = {
  slippage: number
  setSlippage: (slippage: number) => void
}

export const useSlippageState = create<SlippageState>((set) => ({
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: (slippage: number) => set((state) => ({ ...state, slippage })),
}))

export const useSlippage = (): {
  slippageBps: number
} & SlippageState => {
  const { slippage, setSlippage: setSlippageState } = useSlippageState((state) => {
    const slippage = getSlippage()

    return {
      ...state,
      slippage,
      slippageBps: slippage * 100,
    }
  })

  const setSlippage = (slippage: number) => {
    try {
      setSlippageState(slippage)
      localStorage.setItem(BANX_SLIPPAGE_STATE_LS_KEY, JSON.stringify(slippage))
    } catch (error) {
      console.error(error)
    }
  }

  return { slippage, slippageBps: slippage * 100, setSlippage }
}

export const getSlippage = () => {
  try {
    const slippageJSON = localStorage.getItem(BANX_SLIPPAGE_STATE_LS_KEY)

    //? If slippage isn't saved in LS --> return default
    if (!slippageJSON) {
      return DEFAULT_SLIPPAGE
    }

    const slippage: number = JSON.parse(slippageJSON)

    //? Check LS data validity
    z.number().parse(slippage)

    return slippage
  } catch (error) {
    console.error('Invalid slippage value in LS. Value was removed')
    localStorage.removeItem(BANX_SLIPPAGE_STATE_LS_KEY)
    return DEFAULT_SLIPPAGE
  }
}
