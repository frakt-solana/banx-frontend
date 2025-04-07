import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

export enum LoanStatus {
  Active = 'active',
  Refinanced = 'refinanced',
  RefinancedActive = 'refinanced active',
  Repaid = 'repaid',
  PartialRepaid = 'partial repaid',
  Liquidated = 'liquidated',
  Terminating = 'terminating',
  Selling = 'Listed',
}

export const STATUS_LOANS_MAP: Record<string, LoanStatus> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRefinancedActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRepaid]: LoanStatus.Repaid,
  [BondTradeTransactionV2State.PerpetualRefinanceRepaid]: LoanStatus.Refinanced,
  [BondTradeTransactionV2State.PerpetualPartialRepaid]: LoanStatus.PartialRepaid,
  [BondTradeTransactionV2State.PerpetualLiquidatedByClaim]: LoanStatus.Liquidated,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
  [BondTradeTransactionV2State.PerpetualSellingLoan]: LoanStatus.Selling,
}

export const STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE: Record<string, string> = {
  ...STATUS_LOANS_MAP,
  [BondTradeTransactionV2State.PerpetualRefinancedActive]: LoanStatus.RefinancedActive,
}

export const STATUS_LOANS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Refinanced]: 'var(--additional-green-primary-deep)',
  [LoanStatus.RefinancedActive]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Repaid]: 'var(--additional-green-primary-deep)',
  [LoanStatus.PartialRepaid]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-red-primary-deep)',
  [LoanStatus.Liquidated]: 'var(--additional-red-primary-deep)',
  [LoanStatus.Selling]: 'var(--additional-lava-primary-deep)',
}
