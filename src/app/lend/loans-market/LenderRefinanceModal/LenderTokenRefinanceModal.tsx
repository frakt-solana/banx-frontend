import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table, { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { TokenLoan } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { useInstantTokenTransactions } from '../hooks'
import { CollateralCell, FreezeCell, LiquidationLtvCell, LtvCell } from './components'

import styles from './LenderRefinanceModal.module.scss'

interface LenderRefinanceModalProps {
  loans: TokenLoan[]
}

const LenderRefinanceModal: FC<LenderRefinanceModalProps> = ({ loans: initialLoans }) => {
  const { close: closeModal } = useModal()
  const { lendToBorrowAll } = useInstantTokenTransactions()

  const [loans, setLoans] = useState<TokenLoan[]>([...initialLoans])

  const [editingLoanPubkey, setEditingLoanPubkey] = useState<string | null>(null)
  const [tempLiquidationLtv, setTempLiquidationLtv] = useState('')

  const handleEditClick = (loan: TokenLoan) => {
    setEditingLoanPubkey(loan.publicKey)
    setTempLiquidationLtv((loan.liquidationLtvBp / 100).toFixed(0))
  }

  const handleSaveChanges = (loan: TokenLoan) => {
    const newLiquidationLtvBp =
      tempLiquidationLtv.trim() === '' ? 0 : parseFloat(tempLiquidationLtv) * 100

    setLoans((prevLoans) =>
      prevLoans.map((currentLoan) => {
        const isMatchingLoan = currentLoan.publicKey === loan.publicKey
        return isMatchingLoan
          ? { ...currentLoan, liquidationLtvBp: newLiquidationLtvBp }
          : currentLoan
      }),
    )

    setEditingLoanPubkey(null)
  }

  const columns = getTableColumns({
    editingLoanPubkey,
    tempLiquidationLtv,
    setTempLiquidationLtv,
    onEdit: handleEditClick,
    onSave: handleSaveChanges,
  })

  const tableHeight = calculateTableHeight(loans)

  return (
    <Modal className={styles.modal} open onCancel={closeModal} width={572}>
      <h3 className={styles.modalTitle}>Please confirm the terms</h3>
      <div style={{ height: tableHeight }}>
        <Table
          data={loans}
          columns={columns}
          className={styles.tableRoot}
          classNameTableWrapper={styles.tableWrapper}
        />
      </div>
      <div className={styles.footerModalContent}>
        <EmptyList
          message="Loans with LTV higher than LIQ LTV immediately enter a 72‑h termination period"
          className={styles.emptyList}
        />
        <div className={styles.actionButtons}>
          <Button onClick={() => lendToBorrowAll(loans)} className={styles.confirmButton}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default LenderRefinanceModal

type GetTableColumnsParams = {
  editingLoanPubkey: string | null
  tempLiquidationLtv: string
  setTempLiquidationLtv: (val: string) => void
  onEdit: (loan: TokenLoan) => void
  onSave: (loan: TokenLoan) => void
}

export const getTableColumns = (props: GetTableColumnsParams) => {
  const columns: ColumnType<TokenLoan>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" className={styles.headerCellText} align="left" />,
      render: (loan) => <CollateralCell loan={loan} />,
    },
    {
      key: 'freeze',
      title: <HeaderCell label="Freeze" className={styles.headerCellText} />,
      render: (loan) => <FreezeCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" className={styles.headerCellText} />,
      render: (loan) => <LtvCell loan={loan} />,
    },
    {
      key: 'liqLtv',
      title: <HeaderCell label="Liq. LTV" className={styles.headerCellText} />,
      render: (loan) => <LiquidationLtvCell loan={loan} {...props} />,
    },
  ]

  return columns
}

const calculateTableHeight = (data: TokenLoan[]) => {
  const HEADER_ROW_HEIGHT = 20
  const ROW_HEIGHT = 38
  const MAX_TABLE_HEIGHT = 296

  const tableHeight = HEADER_ROW_HEIGHT + data.length * ROW_HEIGHT
  return Math.min(tableHeight, MAX_TABLE_HEIGHT)
}
