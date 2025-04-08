'use client'

import { FC, useMemo } from 'react'

import classNames from 'classnames'
import { MAX_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import _ from 'lodash'
import { useRouter } from 'next/navigation'

import { OnboardingCarousel } from '@banx/components/OnboardingCarousel'
import { ResponsiveImage } from '@banx/components/ResponsiveImage'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/constants'
import { useRenderTimer, useTheme, useTokenMarketsPreview } from '@banx/hooks'
import { buildUrlWithModeAndToken, useTokenType } from '@banx/store'
import { isUsdcTokenType } from '@banx/utils/tokens'

import { ADRASOL_PAIR, JLP_PAIR, LRTS_PAIR, VSOL_PAIR, WFRAGSOL_PAIR } from './[ticker]/constants'
import { useMultiplyMarketData } from './[ticker]/hooks'
import { MultiplyPair } from './[ticker]/types'
import anyTokensDarkImage from './assets/anyTokensDark.png'
import anyTokensLightImage from './assets/anyTokensLight.png'
import { TokenStats, createStatsTokenContent } from './components/TokenStats'
import { MOCK_TOKEN_ITEMS, StatContext, TokenItem } from './constants'
import { convertToUsdcTvl, formatMaxApr } from './helpers'

import styles from './ClientLendingMultiplyPage.module.scss'

export const ClientLendingMultiplyPage = () => {
  useRenderTimer('ClientLendingMultiplyPage')

  const router = useRouter()
  const { tokenType } = useTokenType()
  const { marketsPreview } = useTokenMarketsPreview(LendingTokenType.Usdc)

  //? Pre-defined pairs to display
  const pairsToDisplay = useMemo(
    () => [VSOL_PAIR, WFRAGSOL_PAIR, ADRASOL_PAIR, LRTS_PAIR, JLP_PAIR],
    [],
  )

  //? It is the sum of loansTvl for markets that are not in the pairsToDisplay
  const anyTokensTVL = useMemo(() => {
    const excludedTickers = new Set(pairsToDisplay.map((pair) => pair.collateralTicker))

    return _.chain(marketsPreview)
      .filter((market) => !excludedTickers.has(market.collateral.ticker))
      .sumBy((market) => market.loansTvl ?? 0)
      .value()
  }, [marketsPreview, pairsToDisplay])

  const handleGoToLeveragePage = (ticker: string) => {
    const pathname = `${PATHS.LEVERAGE_BASE}/${ticker}`
    router.push(buildUrlWithModeAndToken(pathname, tokenType))
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.mainSectionTitle}>
            <h1>Multiply</h1>
            <p>Boost your yield or leverage any token you want</p>
          </div>
          <OnboardingCarousel contentType="multiply" />
        </div>

        <div className={styles.tokensList}>
          {pairsToDisplay.map((pair) => (
            <TokenItemLink
              key={pair.collateralMint.toBase58()}
              pair={pair}
              onClick={() => handleGoToLeveragePage(pair.collateralTicker)}
            />
          ))}

          <TokenItemLinkView
            ticker="any"
            onClick={() => handleGoToLeveragePage('any')}
            customContent={<TokenStats ticker="any" stats={createStatsTokenContent('any')} />}
            tvl={anyTokensTVL}
            maxApr={(MAX_APR_SPL / 100).toString()}
          />

          {MOCK_TOKEN_ITEMS.map((tokenItem, idx) => (
            <TokenItemLinkView
              key={idx}
              {...tokenItem}
              onClick={() => handleGoToLeveragePage(tokenItem.ticker)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type TokenItemLinkProps = {
  pair: MultiplyPair
  onClick: () => void
}

const TokenItemLink: FC<TokenItemLinkProps> = ({ pair, onClick }) => {
  const { collateralLogoUrl, collateralTicker, collateralMint } = pair

  const { marketsPreview } = useTokenMarketsPreview(pair.marketTokenType)
  const market = marketsPreview.find((m) => m.collateral.mint === collateralMint.toBase58())

  const { data: multiplyMarketData } = useMultiplyMarketData(
    pair.marketPublicKey.toBase58(),
    pair.minPositionSize?.toNumber(),
  )

  const { maxMultiplier = 0, maxNetApr = 0 } = multiplyMarketData || {}

  const context: StatContext = {
    maxMultiplier,
  }

  const tokenStatsContent = createStatsTokenContent(collateralTicker, context)

  const tvlInUsdc = !isUsdcTokenType(pair.marketTokenType)
    ? convertToUsdcTvl(market)
    : market?.loansTvl

  return (
    <TokenItemLinkView
      onClick={onClick}
      ticker={collateralTicker}
      logoUrl={collateralLogoUrl}
      maxMultiply={maxMultiplier}
      maxApr={formatMaxApr(maxNetApr)}
      customContent={<TokenStats ticker={collateralTicker} stats={tokenStatsContent} />}
      tvl={tvlInUsdc}
    />
  )
}

const TokenItemLinkView: FC<TokenItem & { onClick: () => void }> = ({
  onClick,
  ticker,
  logoUrl,
  tvl,
  maxApr,
  maxMultiply,
  isComingSoon,
  customContent,
}) => {
  const isAnyToken = ticker === 'any'

  const wrapperClass = classNames(
    styles.tokenItemWrapper,
    styles[`tokenItemWrapper--${ticker.toLowerCase()}`] || styles['tokenItemWrapper--default'],
  )

  return (
    <div className={wrapperClass}>
      <div
        onClick={onClick}
        className={classNames(styles.tokenItem, { [styles.comingSoon]: isComingSoon })}
      >
        <div className={styles.tokenItemHeader}>
          <div className={styles.tokenItemHeaderInner}>
            {isAnyToken && <AnyTokenIcon />}
            {!isAnyToken && logoUrl && <TokenIcon ticker={ticker} logoUrl={logoUrl as string} />}
          </div>

          {!!maxMultiply && !isComingSoon && (
            <p className={styles.tokenItemMultiply}>{maxMultiply}X</p>
          )}
        </div>

        <div className={styles.tokenItemBody}>{customContent || 'Available soon'}</div>

        <div className={styles.tokenItemFooter}>
          {!isComingSoon && (
            <>
              <StatInfo
                label="TVL"
                value={<DisplayValue value={tvl || 0} strictTokenType={LendingTokenType.Usdc} />}
                flexType="row"
              />
              <StatInfo
                label="Max apr"
                value={maxApr || '0'}
                valueType={VALUES_TYPES.PERCENT}
                flexType="row"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const AnyTokenIcon = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === 'dark'
  const anyTokenImage = isDarkTheme ? anyTokensDarkImage : anyTokensLightImage

  return (
    <div className={styles.anyTokenIconWrapper}>
      <ResponsiveImage className={styles.anyTokenIconBg} src={anyTokenImage.src} />
      <ResponsiveImage className={styles.anyTokenIcon} src={anyTokenImage.src} />
    </div>
  )
}

const TokenIcon: FC<{ ticker: string; logoUrl: string }> = ({ ticker, logoUrl }) => (
  <>
    <ResponsiveImage className={styles.tokenIconBg} src={logoUrl} />
    <ResponsiveImage className={styles.tokenIcon} src={logoUrl} />
    <p className={styles.tokenItemTicker}>{ticker.toUpperCase()}</p>
  </>
)
