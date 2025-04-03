import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import Faq from '@banx/components/Faq'
import { useWalletSidebar } from '@banx/components/WalletAccountSidebar'

import InputTokenSelect, { ControlsButtons } from '../components/InputTokenSelect'
import OrderBook from './OrderBook'
import { Summary } from './Summary'
import { CollateralField, LtvSlider } from './components'
import { useInstantBorrowContent } from './hooks/useInstantBorrowContent'

import styles from './InstantBorrowContent.module.scss'

const InstantBorrowContent = () => {
  const { connected } = useWallet()
  const { setVisible: setVisibleWalletModal } = useWalletSidebar()

  const {
    offers,
    isLoading,
    selectedOffer,
    maxBorrowableAmount,

    borrowTokensList,
    collateralsList,

    borrowToken,
    borrowInputValue,
    setBorrowInputValue,
    handleBorrowTokenChange,

    collateral,
    collateralInputValue,
    setCollateral,

    maxAvailableLtv,
    ltvSliderValue,
    setLtvSlider,

    errorMessage,
    isBorrowing,
    onSubmit,
  } = useInstantBorrowContent()

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <InputTokenSelect
            label="To borrow"
            value={borrowInputValue}
            onChange={setBorrowInputValue}
            selectedToken={borrowToken}
            onChangeToken={handleBorrowTokenChange}
            tokensList={borrowTokensList}
            className={styles.borrowInput}
            disabled={!connected}
            rightContentJSX={
              connected ? (
                <ControlsButtons
                  onChange={setBorrowInputValue}
                  maxValue={maxBorrowableAmount}
                  hideIcon
                />
              ) : null
            }
          />

          <CollateralField
            label="Your collateral"
            value={collateralInputValue}
            collateral={collateral}
            onChange={setCollateral}
            tokensList={collateralsList}
          />

          <LtvSlider
            label="LTV"
            value={ltvSliderValue}
            onChange={setLtvSlider}
            maxAvailableLtv={maxAvailableLtv}
            disabled={offers.length === 0 || !connected}
          />

          <div className={styles.footerContent}>
            <Summary offer={selectedOffer} collateral={collateral} />

            {connected && (
              <Button
                onClick={onSubmit}
                className={styles.borrowButton}
                disabled={!!errorMessage}
                loading={isLoading || (isBorrowing && !errorMessage)}
              >
                {errorMessage || 'Borrow'}
              </Button>
            )}

            {!connected && (
              <Button onClick={() => setVisibleWalletModal(true)} className={styles.borrowButton}>
                Connect wallet
              </Button>
            )}
          </div>
        </div>

        <OrderBook
          offers={offers}
          borrowInputValue={borrowInputValue}
          collateral={collateral}
          loading={isLoading}
        />
      </div>
      <Faq type="borrow" className={styles.faqContainer} />
    </>
  )
}

export default InstantBorrowContent
