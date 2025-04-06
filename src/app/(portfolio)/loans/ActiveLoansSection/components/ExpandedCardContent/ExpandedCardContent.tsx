import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter } from 'lodash'

import { RBOption } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

import { useLoansSorting, useLoansState } from '../../hooks'
import { FilterStatus, FilterTableSection } from './FilterTableSection'
import { Summary } from './Summary'
import { getTableColumns } from './columns'

import styles from './ExpandedCardContent.module.scss'

interface ExpandedCardContentProps {
  loans: Loan[]
}

const HEADER_ROW_HEIGHT = 26
const ROW_HEIGHT = 38
const MAX_TABLE_HEIGHT = 240

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({ loans }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkey = walletPublicKey?.toBase58() || ''

  const oraclePriceFeedType = loans[0].collateral.oraclePriceFeedType

  const {
    selection: selectedLoans,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useLoansState()

  useEffect(() => {
    clearSelection()
  }, [clearSelection])

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
    (loan: Loan) => toggleLoanInSelection(loan, walletPubkey),
    [toggleLoanInSelection, walletPubkey],
  )

  const [currentOption, setCurrentOption] = useState<RBOption | undefined>()

  const filteredLoans = useMemo(() => {
    if (!currentOption) return loans

    if (currentOption.value === FilterStatus.TERMINATING) {
      return filter(loans, isTokenLoanTerminating)
    }

    if (currentOption.value === FilterStatus.REPAYMENT_CALL) {
      return filter(loans, isTokenLoanRepaymentCallActive)
    }

    return loans
  }, [currentOption, loans])

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      return clearSelection()
    }

    return setSelection(filteredLoans, walletPubkey)
  }, [clearSelection, hasSelectedLoans, filteredLoans, setSelection, walletPubkey])

  const { sortedLoans, selectedSortOption, onChangeSortOption } = useLoansSorting(filteredLoans)

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
          condition: isTokenLoanTerminating,
          className: styles.terminated,
        },
        {
          condition: isTokenLoanRepaymentCallActive,
          className: styles.repaymentCallActive,
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
        loans={sortedLoans}
        selectedLoansOptimistics={selectedLoans}
        setSelection={setSelection}
      />
    </>
  )
}

export default ExpandedCardContent
