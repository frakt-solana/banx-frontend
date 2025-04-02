export const isActivePath = (pathname = '', strict = false) => {
  if (strict) {
    return location.pathname === pathname
  }

  return location.pathname.startsWith(pathname)
}

export const isLinkOrSubLinkActive = (
  pathname: string,
  subLinks?: Array<{ pathname: string }>,
): boolean => {
  return (
    isActivePath(pathname, true) ||
    subLinks?.some((subLink) => isActivePath(subLink.pathname, true)) ||
    false
  )
}
