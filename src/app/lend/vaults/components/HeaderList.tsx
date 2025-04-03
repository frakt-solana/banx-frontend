import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../page.module.scss'

export const HeaderList = () => {
  const stats = [
    { label: 'APY', tooltipText: TOOLTIP_TEXTS.CURRENT_APY },
    { label: 'TVL', tooltipText: TOOLTIP_TEXTS.TVL },
    { label: 'My deposit' },
  ]

  return (
    <div className={styles.headerList}>
      <div className={styles.headerMainStat}>
        <span className={styles.headerStatLabel}>Tokens</span>
      </div>

      <div className={styles.headerStats}>
        {stats.map(({ label, tooltipText }, index) => (
          <div key={index} className={styles.headerAdditionalStat}>
            <span className={styles.headerStatLabel}>{label}</span>
            {tooltipText && <Tooltip title={tooltipText} />}
          </div>
        ))}
      </div>
    </div>
  )
}
