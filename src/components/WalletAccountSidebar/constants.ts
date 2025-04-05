import { FC, SVGProps } from 'react'

import { DISCORD } from '@banx/constants'
import { DOCS_URL, GITHUB_URL, GOVERNANCE_URL, X_URL } from '@banx/constants/urls'
import { Discord, Docs, Github, Governance, Ledger, MathWallet, Twitter } from '@banx/icons'

export const iconComponents: { [key: string]: FC<SVGProps<SVGSVGElement>> } = {
  Ledger,
  MathWallet,
}

export const COMMUNITY_LINKS = [
  {
    name: 'Governance',
    url: GOVERNANCE_URL,
    icon: Governance,
  },
  {
    name: 'Twitter',
    url: X_URL,
    icon: Twitter,
  },
  {
    name: 'Discord',
    url: DISCORD.SERVER_URL,
    icon: Discord,
  },
  {
    name: 'Docs',
    url: DOCS_URL,
    icon: Docs,
  },
  {
    name: 'Github',
    url: GITHUB_URL,
    icon: Github,
  },
]
