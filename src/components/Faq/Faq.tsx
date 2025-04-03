'use client'

import React, { useEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'
import { FAQ_DATA, FaqType } from './constants'

import styles from './Faq.module.scss'

type FaqProps = {
  type: `${FaqType}`
  className?: string
}

const Faq: React.FC<FaqProps> = ({ type, className }) => {
  const faqItems = FAQ_DATA[type] || []
  const [expandedIndex, setExpandedIndex] = useState<null | number>(null)

  const contentRefs = useRef<Array<HTMLDivElement | null>>([])

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx))
  }

  //? Dynamically update the height and opacity of the expanded/collapsed item
  useEffect(() => {
    contentRefs.current.forEach((el, idx) => {
      if (el) {
        const isExpanded = expandedIndex === idx
        const contentHeight = isExpanded ? el.scrollHeight : 0

        el.style.height = `${contentHeight}px`
        el.style.opacity = isExpanded ? '1' : '0'
      }
    })
  }, [expandedIndex])

  return (
    <div className={classNames(styles.faqContainer, className)}>
      <h2 className={styles.faqTitle}>FAQ</h2>
      {faqItems.map(({ question, answer }, idx) => {
        const isExpanded = expandedIndex === idx

        return (
          <div key={idx} className={styles.faqItem} onClick={() => toggleExpand(idx)}>
            <div className={styles.faqQuestionContent}>
              <span className={styles.questionText}>{question}</span>
              <Button type="circle" variant="secondary" size="medium">
                <ChevronDown
                  className={classNames(styles.chevron, { [styles.expanded]: isExpanded })}
                />
              </Button>
            </div>
            <div
              ref={(el) => {
                contentRefs.current[idx] = el
              }}
              className={classNames(styles.faqAnswer)}
            >
              <span className={styles.answerText}>{answer}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Faq
