import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter } from 'lodash'

import { RBOption } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { TokenLoan } from '@banx/api'
import {
  isTokenLoanLiquidated,
  isTokenLoanListed,
  isTokenLoanRepaymentCallActive,
  isTokenLoanSelling,
  isTokenLoanTerminating,
  isTokenLoanUnderWater,
} from '@banx/utils'

import { useLenderLoansSorting, useLenderLoansState } from '../../hooks'
import { FilterStatus, FilterTableSection, LOAN_FILTERS } from './FilterTableSection'
import { checkIfFreezeExpired } from './ManageModal/helpers'
import { Summary } from './Summary'
import { getTableColumns } from './columns'

import styles from './ExpandedCardContent.module.scss'

interface ExpandedCardContentProps {
  loans: TokenLoan[]
}

const HEADER_ROW_HEIGHT = 26
const ROW_HEIGHT = 38
const MAX_TABLE_HEIGHT = 240

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({ loans }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkey = walletPublicKey?.toBase58() || ''

  const lendingToken = loans[0].bondTradeTransaction.lendingToken
  const oraclePriceFeedType = loans[0].collateral.oraclePriceFeedType

  const {
    selection: selectedLoans,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useLenderLoansState()

  useEffect(() => {
    clearSelection()
  }, [clearSelection])

  const loansToClaim = useMemo(() => loans.filter((loan) => isTokenLoanLiquidated(loan)), [loans])

  const loansToTerminate = useMemo(() => {
    return loans.filter(
      (loan) =>
        !isTokenLoanTerminating(loan) && !isTokenLoanListed(loan) && checkIfFreezeExpired(loan),
    )
  }, [loans])

  const walletSelectedLoans = useMemo(() => {
    if (!walletPubkey) return []

    return selectedLoans.filter(({ wallet }) => wallet === walletPubkey)
  }, [selectedLoans, walletPubkey])

  const hasSelectedLoans = !!walletSelectedLoans.length

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => find(loanPubkey, walletPubkey),
    [find, walletPubkey],
  )

  const onRowClick = useCallback(
    (loan: TokenLoan) => {
      const canSelect =
        !isTokenLoanLiquidated(loan) &&
        !isTokenLoanTerminating(loan) &&
        !isTokenLoanListed(loan) &&
        checkIfFreezeExpired(loan)

      if (!canSelect) return
      toggleLoanInSelection(loan, walletPubkey)
    },
    [toggleLoanInSelection, walletPubkey],
  )

  const [currentOption, setCurrentOption] = useState<RBOption | undefined>()

  const filteredLoans = useMemo(() => {
    if (!currentOption || currentOption.value === FilterStatus.ALL) return loans

    const filterFn = LOAN_FILTERS[currentOption.value as FilterStatus]
    return filterFn ? filter(loans, filterFn) : loans
  }, [currentOption, loans])

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      return clearSelection()
    }

    return setSelection(loansToTerminate, walletPubkey)
  }, [clearSelection, hasSelectedLoans, loansToTerminate, setSelection, walletPubkey])

  const { sortedLoans, selectedSortOption, onChangeSortOption } =
    useLenderLoansSorting(filteredLoans)

  const columns = getTableColumns({
    findLoanInSelection,
    onSelectAll,
    onRowClick,
    hasSelectedLoans,
    onSort: onChangeSortOption,
    selectedSortOption,
    oraclePriceFeedType,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: (loan: TokenLoan) => isTokenLoanTerminating(loan),
          className: styles.loanTerminating,
          cardClassName: styles.loanTerminating,
        },
        {
          condition: (loan: TokenLoan) => isTokenLoanLiquidated(loan),
          className: styles.loanLiquidated,
          cardClassName: styles.loanLiquidated,
        },
        {
          condition: (loan: TokenLoan) =>
            isTokenLoanUnderWater(loan) && !isTokenLoanRepaymentCallActive(loan),
          className: styles.loanUnderwater,
          cardClassName: styles.loanUnderwater,
        },
        {
          condition: (loan: TokenLoan) => isTokenLoanRepaymentCallActive(loan),
          className: styles.loanRepaymentCallActive,
          cardClassName: styles.loanRepaymentCallActive,
        },
        {
          condition: (loan: TokenLoan) => isTokenLoanSelling(loan),
          className: styles.loanSelling,
          cardClassName: styles.loanSelling,
        },
      ],
    }
  }, [onRowClick])

  const tableHeight = useMemo(
    () => Math.min(HEADER_ROW_HEIGHT + loans.length * ROW_HEIGHT, MAX_TABLE_HEIGHT),
    [loans],
  )

  return (
    <>
      <FilterTableSection loans={loans} onChange={setCurrentOption} currentOption={currentOption} />

      <div style={{ height: tableHeight }}>
        <Table
          data={sortedLoans}
          columns={columns}
          rowParams={rowParams}
          className={styles.table}
          classNameTableWrapper={styles.tableWrapper}
        />
      </div>

      <Summary
        loansToClaim={loansToClaim}
        loansToTerminate={loansToTerminate}
        selectedLoansOptimistics={selectedLoans}
        setSelection={setSelection}
        lendingToken={lendingToken}
      />
    </>
  )
}

export default ExpandedCardContent
