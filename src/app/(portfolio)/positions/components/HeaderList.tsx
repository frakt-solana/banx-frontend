import Tooltip from '@banx/components/Tooltip'

import { TOOLTIP_TEXTS } from '../constants'

import styles from '../ClientPositionsPage.module.scss'

export const HeaderList = () => {
  const stats = [
    { label: 'Leverage' },
    { label: 'Collateral' },
    { label: 'Debt', tooltipText: TOOLTIP_TEXTS.DEBT },
    { label: 'NET APR', tooltipText: TOOLTIP_TEXTS.APR },
    { label: 'Created' },
    { label: 'PNL', tooltipText: TOOLTIP_TEXTS.PNL },
  ]

  return (
    <div className={styles.headerList}>
      <div className={styles.headerMainStat}>
        <span className={styles.headerStatLabel}>Position</span>
      </div>

      <div className={styles.headerStats}>
        {stats.map(({ label, tooltipText }, index) => (
          <div key={index} className={styles.headerAdditionalStat}>
            <span className={styles.headerStatLabel}>{label}</span>
            {tooltipText && <Tooltip label={tooltipText} />}
          </div>
        ))}
      </div>
    </div>
  )
}
