import { Adapter, WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import _ from 'lodash'

type UseWalletAdapters = (
  props?: Partial<{
    onWalletSelect: () => void
  }>,
) => Array<{ adapter: Adapter; select: () => void }>

export const useWalletAdapters: UseWalletAdapters = (props) => {
  const { onWalletSelect } = props ?? {}

  const { wallets, select } = useWallet()

  const createSelectHanlder = (walletName: WalletName) => () => {
    select(walletName)
    onWalletSelect?.()
  }

  const adapters = _.chain(wallets)
    .map(({ adapter }) => ({
      adapter,
      select: createSelectHanlder(adapter.name),
    }))
    .value()

  return adapters
}
