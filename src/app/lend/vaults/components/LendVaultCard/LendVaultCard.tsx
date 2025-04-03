import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { VaultPreview } from '@banx/api/tokens'

import { TOOLTIP_TEXTS } from '../../constants'
import { TvlProgressIndicator } from '../TvlProgressIndicator'

import styles from './LendVaultCard.module.scss'

interface LendVaultCardProps {
  vaultPreview: VaultPreview
  onClick: () => void
}

export const LendVaultCard: FC<LendVaultCardProps> = ({ vaultPreview, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardBody}>
        <MarketMainInfo vaultPreview={vaultPreview} />
        <div className={styles.additionalContentWrapper}>
          <VaultAdditionalInfo vaultPreview={vaultPreview} />
          <Button className={styles.actionButton} size="medium">
            Manage
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LendVaultCard

interface MarketMainInfoProps {
  vaultPreview: VaultPreview
}

const MarketMainInfo: FC<MarketMainInfoProps> = ({ vaultPreview }) => (
  <div className={styles.mainInfoContainer}>
    <AssetsLogos assets={vaultPreview.assetsDetails} />
    <h4 className={styles.collateralName}>{vaultPreview.vaultName}</h4>
  </div>
)

interface VaultAdditionalInfoProps {
  vaultPreview: VaultPreview
}

const VaultAdditionalInfo: FC<VaultAdditionalInfoProps> = ({ vaultPreview }) => {
  const { totalDepositedAmount, maxCapacity, currentApy, lendingToken } = vaultPreview

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={styles.additionalInfoStats}>
      <StatInfo
        label="APY"
        value={currentApy / 100}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText={TOOLTIP_TEXTS.CURRENT_APY}
        classNamesProps={{ ...classNamesProps, value: styles.additionalApyStat }}
      />
      <StatInfo
        label="TVL"
        value={
          <TvlProgressIndicator
            totalDepositedAmount={totalDepositedAmount}
            maxCapacity={maxCapacity}
            lendingToken={lendingToken}
            className={styles.tvlProgress}
          />
        }
        tooltipText={TOOLTIP_TEXTS.TVL}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="My deposit"
        value={
          <DisplayValue
            value={vaultPreview.userTotalDepositedAmount}
            strictTokenType={lendingToken}
          />
        }
        classNamesProps={classNamesProps}
      />
    </div>
  )
}

interface AssetsLogosProps {
  assets: VaultPreview['assetsDetails']
}

const VISIBLE_ASSETS_LIMIT = 3

export const AssetsLogos: FC<AssetsLogosProps> = ({ assets }) => {
  const visibleAssets = assets.slice(0, VISIBLE_ASSETS_LIMIT)
  const hiddenAssets = assets.slice(VISIBLE_ASSETS_LIMIT)

  return (
    <div className={styles.assetsLogosContainer}>
      {visibleAssets.map((asset) => (
        <Tooltip key={asset.mint} title={<VisibleAssetTooltip asset={asset} />}>
          <ResponsiveImage
            src={asset.logoUrl}
            className={classNames(styles.assetLogo, {
              [styles.stackedLogo]: visibleAssets.length > 1,
            })}
          />
        </Tooltip>
      ))}

      {hiddenAssets.length > 0 && (
        <Tooltip title={<HiddenAssetsTooltip assets={hiddenAssets} />}>
          <div className={styles.extraAssetsCount}>+{hiddenAssets.length}</div>
        </Tooltip>
      )}
    </div>
  )
}

const VisibleAssetTooltip: FC<{ asset: VaultPreview['assetsDetails'][0] }> = ({ asset }) => (
  <span className={styles.assetTooltipTicker}>{asset.ticker}</span>
)

const HiddenAssetsTooltip: FC<{ assets: VaultPreview['assetsDetails'] }> = ({ assets }) => (
  <div className={styles.assetsTooltipContent}>
    {assets.map((asset) => (
      <div key={asset.mint} className={styles.assetTooltipItem}>
        <ResponsiveImage src={asset.logoUrl} className={styles.assetTooltipLogo} />
        <span className={styles.assetTooltipTicker}>{asset.ticker}</span>
      </div>
    ))}
  </div>
)
