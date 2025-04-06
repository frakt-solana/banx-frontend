import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateTokensPerCollateralFloat } from 'fbonds-core/lib/fbond-protocol/tokenLendingUtils'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan, convertBondOfferV3ToCore } from '@banx/api'
import { useModal } from '@banx/store/common'
import {
  bnToNumberSafe,
  calcOfferLtvPercent,
  calculateOfferSize,
  formatTokensPerCollateral,
  getTokenDecimals,
} from '@banx/utils'

import OrderBook from './OrderBook'
import { getCurrentLoanInfo } from './helpers'
import { useRefinanceTokenModal } from './hooks'

import styles from './RefinanceTokenModal.module.scss'

//? constants
const MAX_LTV_THRESHOLD = 100

interface RefinanceTokenModalProps {
  loan: Loan
}

const RefinanceTokenModal: FC<RefinanceTokenModalProps> = ({ loan }) => {
  const wallet = useWallet()
  const { close: closeModal } = useModal()

  const { offers, isLoading, refinance, lendingToken } = useRefinanceTokenModal(loan)

  const { currentDebt, currentBorrowedAmount, currentApr, marketUpfrontFee } =
    getCurrentLoanInfo(loan)

  const filteredOffers = useMemo(() => {
    const upfrontFee = new BN(currentDebt).mul(new BN(marketUpfrontFee)).div(new BN(BASE_POINTS))

    return (
      chain(offers)
        //? (1) Exclude the user's own offers
        .filter((offer) => wallet?.publicKey?.toBase58() !== offer.assetReceiver.toBase58())
        //? (2) Exclude offers that cannot cover the upfront fee of the previous loan
        .filter((offer) => upfrontFee.lte(calculateOfferSize(convertBondOfferV3ToCore(offer))))
        //? (3) Exclude offers that exceed the maximum allowed LTV threshold
        .filter((offer) => {
          const lendingTokenDecimals = getTokenDecimals(lendingToken)
          const tokensPerCollateralFloat = calculateTokensPerCollateralFloat(
            bnToNumberSafe(offer.validation.collateralsPerToken),
            loan.collateral.decimals,
            lendingTokenDecimals,
          )

          const tokensPerCollateral = parseFloat(
            formatTokensPerCollateral(tokensPerCollateralFloat, lendingTokenDecimals),
          )

          const ltvPercent = calcOfferLtvPercent({
            tokensPerCollateral,
            collateralPrice: loan.collateralPrice,
            lendingTokenDecimals,
          })

          return ltvPercent <= MAX_LTV_THRESHOLD
        })
        //? (4) Sort in ascending order by collateralsPerToken
        .sortBy((offer) => bnToNumberSafe(offer.validation.collateralsPerToken))
        .value()
    )
  }, [currentDebt, marketUpfrontFee, offers, wallet?.publicKey, lendingToken, loan])

  return (
    <Modal open onCancel={closeModal} width={572} className={styles.refinanceModal}>
      <h4 className={styles.refinanceModalTitle}>Current loan</h4>

      <LoansInfoStats
        apr={currentApr}
        borrowedAmount={currentBorrowedAmount}
        debt={currentDebt}
        lendingToken={lendingToken}
        liquidationLtvBp={loan.liquidationLtvBp}
      />

      <h4 className={styles.refinanceModalSubtitle}>New loan</h4>

      <OrderBook loan={loan} offers={filteredOffers} refinance={refinance} isLoading={isLoading} />
    </Modal>
  )
}

export default RefinanceTokenModal

interface LoansInfoStats {
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
  liquidationLtvBp: number //? base points
  lendingToken: LendingTokenType
}

const LoansInfoStats: FC<LoansInfoStats> = ({
  borrowedAmount,
  debt,
  apr,
  liquidationLtvBp,
  lendingToken,
}) => {
  const statsClassName = {
    container: styles.loanInfoStat,
    label: styles.loanInfoLabel,
    value: styles.loanInfoValue,
  }

  return (
    <div className={styles.loanInfoStats}>
      <StatInfo
        label="Borrowed"
        value={<DisplayValue value={borrowedAmount} strictTokenType={lendingToken} />}
        classNamesProps={statsClassName}
      />

      <StatInfo
        label="APR"
        valueType={VALUES_TYPES.PERCENT}
        value={apr / 100}
        classNamesProps={statsClassName}
      />
      {!!liquidationLtvBp && (
        <StatInfo
          label="Liq. LTV"
          value={liquidationLtvBp / 100}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={statsClassName}
        />
      )}
      <StatInfo
        label="Debt"
        value={<DisplayValue value={debt} strictTokenType={lendingToken} />}
        classNamesProps={statsClassName}
      />
    </div>
  )
}
