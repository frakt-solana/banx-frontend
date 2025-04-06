export enum LoanStatus {
  Active = 'activeLoans',
  Terminating = 'terminating',
  Liquidation = 'liquidation',
}

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary)',
  [LoanStatus.Liquidation]: 'var(--additional-red-primary)',
}

export const LOAN_STATUS_DISPLAY_NAMES: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'Active Loans',
  [LoanStatus.Terminating]: 'Terminating Loans',
  [LoanStatus.Liquidation]: 'Liquidating within 24h',
}

export const DEFAULT_NO_DATA_CHART = {
  value: [100],
  colors: ['var(--content-tertiary)'],
}
