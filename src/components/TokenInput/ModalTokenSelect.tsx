'use client'

import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { useWallet } from '@solana/wallet-adapter-react'

import { Input } from '@banx/components/inputs/Input'
import { Modal } from '@banx/components/modals/BaseModal'

import { CollateralToken } from '@banx/api/tokens'
import { useModal } from '@banx/store'
import { bnToHuman, formatCollateralTokenValue, shortenAddress } from '@banx/utils'

import styles from './TokenInput.module.scss'

type ModalTokenSelectProps = {
  pinnedTokensMints?: string[]
  onChangeToken?: (option: CollateralToken) => void
  tokensList: CollateralToken[]
}

const ModalTokenSelect = ({
  tokensList,
  onChangeToken,
  pinnedTokensMints = [],
}: ModalTokenSelectProps) => {
  const { close: closeModal } = useModal()

  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const filteredTokensList = useMemo(() => {
    const normalize = (value: string) => value.toLowerCase()

    const normalizedSearchInput = normalize(searchInput)

    return tokensList.filter(({ collateral }) => {
      const { ticker, mint, name } = collateral
      return [ticker, mint, name].some((field) => normalize(field).includes(normalizedSearchInput))
    })
  }, [tokensList, searchInput])

  const pinnedTokensList = useMemo(() => {
    return tokensList.filter((token) => pinnedTokensMints.includes(token.collateral.mint))
  }, [tokensList, pinnedTokensMints])

  const handleChangeToken = (token: CollateralToken) => {
    onChangeToken?.(token)
    closeModal()
  }

  const internalRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.focus()
    }
  }, [])

  return (
    <Modal className={styles.modal} open width={468} onCancel={closeModal}>
      <div className={styles.searchInputWrapper}>
        <SearchOutlined className={styles.searchIcon} />
        <Input
          ref={internalRef}
          value={searchInput}
          onChange={handleSearchInputChange}
          placeholder="Search by token"
          className={styles.searchInput}
        />
      </div>

      <PinnedTokensList onChange={handleChangeToken} tokensList={pinnedTokensList} />

      <TokensListLabels />

      <div className={styles.tokensList}>
        {filteredTokensList.map((token) => (
          <TokenListItem
            key={token.collateral.mint}
            token={token}
            onClick={() => handleChangeToken(token)}
          />
        ))}
      </div>
    </Modal>
  )
}

export default ModalTokenSelect

type TokenListItemProps = {
  token: CollateralToken
  onClick: () => void
}

const TokenListItem: FC<TokenListItemProps> = ({ token, onClick }) => (
  <div onClick={onClick} className={styles.tokensListItem}>
    <div className={styles.tokensListItemInfo}>
      <img src={token.collateral.logoUrl} className={styles.tokensListItemIcon} />
      <div className={styles.flexCol}>
        <span className={styles.tokensListItemTicker}>{token.collateral.ticker}</span>
        <span className={styles.tokensListItemAddress}>
          {shortenAddress(token.collateral.mint)}
        </span>
      </div>
    </div>
    <TokenBalanceInfo token={token} />
  </div>
)

type TokenBalanceInfoProps = {
  token: CollateralToken
}

const TokenBalanceInfo: FC<TokenBalanceInfoProps> = ({ token }) => {
  const USDC_BALANCE_TRESHOLD = 0.001

  const { amountInWallet, collateral } = token

  if (!amountInWallet) return null

  const tokensAmount = bnToHuman(amountInWallet, collateral.decimals)
  const tokensAmountInUsd = tokensAmount * collateral.priceUsd

  return (
    <div className={styles.tokensListItemBalanceInfo}>
      <span className={styles.tokensListItemCollateralsAmount}>
        {formatCollateralTokenValue(tokensAmount)}
      </span>

      {!!tokensAmountInUsd && tokensAmountInUsd > USDC_BALANCE_TRESHOLD && (
        <span className={styles.tokensListItemCollateralsAmountUsd}>
          ${formatCollateralTokenValue(tokensAmountInUsd)}
        </span>
      )}
    </div>
  )
}

const TokensListLabels = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.tokensListLabels}>
      <span className={styles.tokenListLabel}>Token</span>
      {connected && <span className={styles.tokenListLabel}>Available</span>}
    </div>
  )
}

type PinnedTokensListProps = {
  onChange: (token: CollateralToken) => void
  tokensList: CollateralToken[]
}

const PinnedTokensList: FC<PinnedTokensListProps> = ({ onChange, tokensList }) => {
  return (
    <div className={styles.pinnedTokensList}>
      {tokensList.map((token) => (
        <div
          key={token.collateral.mint}
          onClick={() => onChange(token)}
          className={styles.pinnedToken}
        >
          <img src={token.collateral.logoUrl} className={styles.pinnedTokenIcon} />
          <span className={styles.pinnedTokenLabel}>{token.collateral.ticker}</span>
        </div>
      ))}
    </div>
  )
}
