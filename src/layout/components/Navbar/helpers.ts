export const isPathActive = (current: string, target: string, strict = false): boolean => {
  if (strict) return current === target
  return current.startsWith(target)
}
