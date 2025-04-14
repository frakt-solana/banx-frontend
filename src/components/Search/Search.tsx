import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'

import { IconSearch } from '@tabler/icons-react'

import { useOnClickOutside } from '@banx/hooks'
import { CloseModal } from '@banx/icons'

import { Button } from '../Buttons'
import { Input } from '../inputs/Input'

import styles from './Search.module.scss'

interface SearchProps {
  value: string
  onChange: (query: string) => void
  placeholder?: string
}

export const Search: FC<SearchProps> = ({ value, onChange, placeholder = 'Search...' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(containerRef, () => {
    setIsOpen(false)
  })

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={styles.searchWrapper} ref={containerRef}>
      {isOpen ? (
        <div className={styles.searchContainer}>
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={styles.searchInput}
          />
          <CloseModal className={styles.closeIcon} onClick={handleToggle} />
        </div>
      ) : (
        <CollapsedContent onClick={handleToggle} />
      )}
    </div>
  )
}

interface CollapsedContentProps {
  onClick: () => void
}

export const CollapsedContent: FC<CollapsedContentProps> = ({ onClick }) => (
  <Button className={styles.collapsedButton} type="circle" variant="tertiary" onClick={onClick}>
    <IconSearch className={styles.searchIcon} />
    <span className={styles.searchText}>Search</span>
  </Button>
)

export function filterBySearchQuery<T>(
  data: T[],
  query: string,
  pathFns: Array<(item: T) => unknown>,
): T[] {
  if (!data || query.trim() === '') {
    return data || []
  }

  const lowerCaseQuery = query.toLowerCase()

  const filteredData = data.filter((item) =>
    pathFns.some((pathFn) => {
      const value = pathFn(item)
      return String(value).toLowerCase().includes(lowerCaseQuery)
    }),
  )

  return filteredData
}
