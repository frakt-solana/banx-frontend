import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { LendTokenActivityTable } from '@banx/components/CommonTables'
import PlaceTokenOfferSection, { OrderBook } from '@banx/components/PlaceTokenOfferSection'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { TokenOfferPreview } from '@banx/api'
import { useMarketTokenRewards } from '@banx/hooks'
import { useModal } from '@banx/store/common'

import styles from './ExpandedCardContent.module.scss'

interface ExpandedCardContentProps {
  market: TokenOfferPreview['tokenMarketPreview']
  lendingToken: LendingTokenType
  offerPubkey: string
}

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({
  market,
  lendingToken,
  offerPubkey,
}) => {
  const { marketRewards } = useMarketTokenRewards(market.marketPubkey)

  const { open: openModal } = useModal()

  const showModal = () => {
    openModal(OffersModal, { market, offerPubkey, lendingToken })
  }

  return (
    <div
      className={classNames(styles.container, { [styles.rewardsContent]: !isEmpty(marketRewards) })}
    >
      <div className={styles.placeOfferContainer}>
        <Button
          className={styles.showOffersMobileButton}
          onClick={showModal}
          type="circle"
          variant="tertiary"
        >
          See offers
        </Button>

        <PlaceTokenOfferSection
          marketPubkey={market.marketPubkey}
          offerPubkey={offerPubkey}
          marketRewards={marketRewards}
          lendingToken={lendingToken}
        />
      </div>

      <div className={styles.tabsContent}>
        <TabsContent market={market} lendingToken={lendingToken} offerPubkey={offerPubkey} />
      </div>
    </div>
  )
}

export default ExpandedCardContent

interface TabsContent extends ExpandedCardContentProps {}
const TabsContent: FC<TabsContent> = ({ market, lendingToken, offerPubkey }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.OFFER,
  })

  return (
    <>
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === TabName.OFFER && (
        <OrderBook market={market} lendingToken={lendingToken} offerPubkey={offerPubkey} />
      )}
      {currentTabValue === TabName.ACTIVITY && (
        <LendTokenActivityTable marketPubkey={market.marketPubkey} />
      )}
    </>
  )
}

interface OffersModal extends ExpandedCardContentProps {}
const OffersModal: FC<OffersModal> = (props) => {
  const { close } = useModal()

  return (
    <Modal className={styles.modal} open onCancel={close}>
      <TabsContent {...props} />
    </Modal>
  )
}

export enum TabName {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

export const TABS = [
  {
    label: 'Offer',
    value: TabName.OFFER,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]
