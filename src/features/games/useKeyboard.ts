import { useEffect } from 'react'

/**
 * Physical keyboard input for games: letters (uppercased), digits, Enter and Backspace.
 * Ignores keystrokes aimed at inputs so host text fields keep working.
 */
export function useKeyboard(handler: (key: string) => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault()
        handler(e.key)
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        handler(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handler, enabled])
}
