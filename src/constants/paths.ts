export const PATHS = {
  ROOT: '/',
  PAGE_404: '/404',

  LEVERAGE_BASE: '/multiply',
  LEVERAGE: '/multiply/:ticker',
  LOANS: '/loans',
  OFFERS: '/offers',
  POSITIONS: '/positions',

  BORROW: '/borrow',

  LEND: '/lend',
  LEND_VAULTS: '/lend/vaults',
  LEND_VAULT: '/lend/vaults/:vaultPubkey',
  LEND_MARKERS: '/lend/markets',
  LEND_MARKET: '/lend/markets/:marketPubkey',
  LEND_LOANS_MARKET: '/lend/loans-market',

  PORTFOLIO: '/portfolio',
  ADVENTURES: '/adventures',
  LEADERBOARD: '/leaderboard',
} as const
