import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../LenderTokenLoansContent.module.scss'

export const HeaderList = () => {
  const stats = [
    { label: 'Claim', tooltipText: TOOLTIP_TEXTS.CLAIM },
    { label: 'WLTV', tooltipText: TOOLTIP_TEXTS.WAPR },
    { label: 'Repaid', tooltipText: TOOLTIP_TEXTS.REPAID },
    { label: 'WAPR', tooltipText: TOOLTIP_TEXTS.WAPR },
    { label: 'Status' },
  ]

  return (
    <div className={styles.headerList}>
      <div className={styles.headerMainStat}>
        <span className={styles.headerStatLabel}>Token</span>
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
