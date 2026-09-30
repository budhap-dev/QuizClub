import { useEffect } from 'react'

let locks = 0

/**
 * Stop the page behind an overlay from scrolling. Counted, so stacked overlays (a dialog over the
 * theme sheet) release it only when the last one closes. Pads for the scrollbar so nothing shifts.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const body = document.body
    if (locks++ === 0) {
      const gutter = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      if (gutter > 0) body.style.paddingRight = `${gutter}px`
    }
    return () => {
      if (--locks === 0) {
        body.style.overflow = ''
        body.style.paddingRight = ''
      }
    }
  }, [active])
}
