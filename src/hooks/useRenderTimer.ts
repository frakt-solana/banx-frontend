import { useEffect, useRef } from 'react'

export const useRenderTimer = (label: string, enabled: boolean = true) => {
  const startRef = useRef<number | null>(null)

  if (typeof window !== 'undefined' && enabled && startRef.current === null) {
    startRef.current = performance.now()
  }

  useEffect(() => {
    if (!enabled || startRef.current === null) return

    const end = performance.now()
    const time = (end - startRef.current).toFixed(2)

    // eslint-disable-next-line no-console
    console.log(
      `%c[Render Timer] %c${label} %c⏱ ${time}ms`,
      'color: #999; font-weight: bold;',
      'color: #61dafb; font-weight: bold;',
      'color: #ffa500;',
    )
  }, [enabled, label])
}
