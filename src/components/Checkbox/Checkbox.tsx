import { FC } from 'react'

import classNames from 'classnames'

import styles from './Checkbox.module.scss'

interface CheckboxProps {
  label?: string
  onChange: () => void
  checked: boolean
  className?: string
  classNameInnerContent?: string
}

const Checkbox: FC<CheckboxProps> = ({
  label,
  onChange,
  checked,
  className,
  classNameInnerContent,
}) => {
  return (
    <div className={classNames(styles.checkbox, className)}>
      <label className={styles.label}>
        <input onChange={onChange} type="checkbox" checked={checked} />
        <p className={styles.labelText}>{label}</p>
        <span className={classNames(styles.checkboxInput, classNameInnerContent)} />
      </label>
    </div>
  )
}

export default Checkbox
