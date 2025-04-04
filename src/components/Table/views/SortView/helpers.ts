import { ColumnType } from '../../types'

interface ParsedTableColumn {
  value: string
  label: string
}

export const parseTableColumn = <T>(column: ColumnType<T>): ParsedTableColumn => {
  const { key, title } = column

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const label = title?.props.label

  return { value: key as string, label }
}
