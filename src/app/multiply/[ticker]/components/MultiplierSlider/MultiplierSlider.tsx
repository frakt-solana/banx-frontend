import React, { Dispatch, FC, SetStateAction, useEffect, useMemo } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import _ from 'lodash'

import { Slider, SliderProps } from '@banx/components/Slider'

import { MIN_MULTIPLIER_VALUE } from '../../constants'
import { LeverageSimpleOffer } from '../../types'

import styles from './MultiplierSlider.module.scss'

type MultiplierSliderProps = {
  multiplierValue: number
  offers: LeverageSimpleOffer[]
  userEnteredCollateralAmount: BN
  setMultiplierValue: Dispatch<SetStateAction<number>>
  selectedOffer: LeverageSimpleOffer | undefined
  setSelectedOffer: Dispatch<SetStateAction<LeverageSimpleOffer | undefined>>
} & Omit<SliderProps, 'value' | 'onChange'>

const MultiplierSliderComponent: FC<MultiplierSliderProps> = ({
  multiplierValue,
  setMultiplierValue,
  offers,
  userEnteredCollateralAmount,
  selectedOffer,
  setSelectedOffer,
  ...props
}) => {
  const patchedOffers = useMemo(() => {
    if (userEnteredCollateralAmount.isZero() || _.isEmpty(offers)) return []

    const patchedOffers = _.chain(offers)
      //? Remove offers with maxCollateralToReceive less than userEnteredCollateralAmount*MIN_MULTIPLIER_VALUE
      .filter(({ maxCollateralToReceive }) => {
        const maxMultiplyForCollateralAmount = maxCollateralToReceive
          .div(userEnteredCollateralAmount)
          .toNumber()
        return maxMultiplyForCollateralAmount >= MIN_MULTIPLIER_VALUE
      })
      //? Patch max multiplier according to userEnteredCollateralAmount
      .map((offer) => {
        const collateralAmountMaxMultiplier = offer.maxCollateralToReceive
          .div(userEnteredCollateralAmount)
          .toNumber()

        return {
          ...offer,
          maxMultiplier:
            collateralAmountMaxMultiplier > offer.maxMultiplier
              ? offer.maxMultiplier
              : collateralAmountMaxMultiplier,
        }
      })

      //? Group offers by maxMultiplier and keep the best offer in each group by apr.
      .thru((offers) => {
        const filteredOffers = _.chain(offers)
          .groupBy(({ maxMultiplier }) => maxMultiplier)
          .values()
          .map((offers) => {
            const sortedOffers = [...offers].sort(
              (offerA, offerB) => offerA.apr.toNumber() - offerB.apr.toNumber(),
            )
            const bestOfferInArray = sortedOffers.at(0)!
            return bestOfferInArray
          })
          .value()

        return filteredOffers
      })
      //? Remove offers (compact) with multiplier intersections and apr higher than intersected offer.
      //? E.g. [apr: 15, maxMultiplier: 2], [apr: 15, maxMultiplier: 4] => [apr: 15, maxMultiplier: 4]
      //? E.g. [apr: 10, maxMultiplier: 2], [apr: 15, maxMultiplier: 4] => [apr: 10, maxMultiplier: 2], [apr: 15, maxMultiplier: 4]
      .thru((offers) => {
        if (offers.length <= 1) return offers

        //? Sort offer by maxMultiplier acs
        const offersSorted = [...offers].sort(
          (offerA, offerB) => offerB.maxMultiplier - offerA.maxMultiplier,
        )

        let offerWithBestApr = offersSorted.at(0)!
        const compactedOffers = [offerWithBestApr]
        for (let i = 1; i < offersSorted.length; i++) {
          const currentOffer = offersSorted.at(i)!

          if (offerWithBestApr.apr.gte(currentOffer.apr)) {
            compactedOffers.push(currentOffer)
            offerWithBestApr = currentOffer
          }
        }

        //? return offers sorted by maxMultiplier decs
        return compactedOffers.reverse()
      })
      .value()

    return patchedOffers
  }, [userEnteredCollateralAmount, offers])

  //? Select offer by default or reset selected offer if input values are incorrect
  useEffect(() => {
    const offerToSelect = patchedOffers.find((offer) => offer.maxMultiplier >= multiplierValue)

    const offerToSelectAreSame =
      offerToSelect?.publicKey.toBase58() === selectedOffer?.publicKey.toBase58()

    if (!offerToSelectAreSame) {
      setSelectedOffer(offerToSelect)
      //? Reset multiplier value if offer was reset
      if (_.isUndefined(offerToSelect)) {
        setMultiplierValue(MIN_MULTIPLIER_VALUE)
      }
    }
  }, [multiplierValue, patchedOffers, selectedOffer, setMultiplierValue, setSelectedOffer])

  const marks = useMemo(() => {
    return _.chain(patchedOffers)
      .map(({ maxMultiplier }) => maxMultiplier)
      .push(MIN_MULTIPLIER_VALUE)
      .sort((a, b) => a - b)
      .uniq()
      .map((multiplier, idx, marks) => {
        //? Show labels only for border marks
        if (idx === 0 || idx === marks.length - 1) {
          return [multiplier, `x${multiplier}`]
        }

        return [multiplier, ' ']
      })
      .fromPairs()
      .value()
  }, [patchedOffers])

  const maxMultiplier = parseInt(Object.keys(marks).at(-1) || '') || MIN_MULTIPLIER_VALUE

  const sliderDisabled = userEnteredCollateralAmount.isZero() || _.isEmpty(patchedOffers)

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabels}>
        <p className={styles.multiplierValueLabel}>
          {'Multiply: '}
          <span
            className={classNames(styles.multiplierValue, {
              [styles.multiplierValueDisabled]: sliderDisabled,
            })}
          >
            x{multiplierValue}
          </span>
        </p>
      </div>

      <Slider
        value={multiplierValue}
        onChange={setMultiplierValue}
        min={MIN_MULTIPLIER_VALUE}
        max={maxMultiplier}
        step={1}
        marks={marks}
        showValue="multiplier"
        className={classNames(styles.multiplierSlider, {
          [styles.multiplierSliderDisabled]: sliderDisabled,
        })}
        {...props}
      />
    </div>
  )
}

export const MultiplierSlider = React.memo(MultiplierSliderComponent)
