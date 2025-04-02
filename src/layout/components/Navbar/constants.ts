import { PATHS } from '@banx/constants'

export type SubNavigationLink = {
  label: string
  pathname: (typeof PATHS)[keyof typeof PATHS]
  description?: string
}

export type NavigationLink = {
  label: string
  pathname: (typeof PATHS)[keyof typeof PATHS]
  subLinks?: SubNavigationLink[]
  disabledText?: string
}

export const TOKEN_NAVIGATION_LINKS: Array<NavigationLink> = [
  {
    label: 'Multiply',
    pathname: PATHS.ROOT,
  },
  {
    label: 'Borrow',
    pathname: PATHS.BORROW,
  },
  {
    label: 'Earn',
    pathname: PATHS.LEND,
    subLinks: [
      {
        label: 'Vaults',
        pathname: PATHS.LEND_VAULTS,
        description: 'Passive Yield, Low Risk, Curated Strategies',
      },
      {
        label: 'Create Offer',
        pathname: PATHS.LEND_MARKERS,
        description: 'Customizable Yield, Flexible Settings, Full Control',
      },
      {
        label: 'Loans market',
        pathname: PATHS.LEND_LOANS_MARKET,
        description: 'Instant yield',
      },
    ],
  },
  {
    label: 'Portfolio',
    pathname: PATHS.PORTFOLIO,
    subLinks: [
      {
        label: 'Overview',
        pathname: PATHS.PORTFOLIO,
        description: 'Track and analyze all your actions on the protocol',
      },
      {
        label: 'My loans',
        pathname: PATHS.LOANS,
        description: 'Manage and track your active borrowings',
      },
      {
        label: 'My offers',
        pathname: PATHS.OFFERS,
        description: 'View and manage your lending offers',
      },
      {
        label: 'My multiplies',
        pathname: PATHS.POSITIONS,
        description: 'View and manage your active multiplies',
      },
    ],
  },
  {
    label: 'Rewards',
    pathname: PATHS.LEADERBOARD,
    subLinks: [
      {
        label: 'Rewards',
        pathname: PATHS.LEADERBOARD,
        description: 'Get rewards for active protocol use',
      },
      {
        label: 'Stake',
        pathname: PATHS.ADVENTURES,
        description: 'Stake your Banx NFTs and $BANX to earn and boost rewards',
      },
    ],
  },
]
