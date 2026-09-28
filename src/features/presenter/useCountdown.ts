import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '@/utils/sounds'

interface Countdown {
  remaining: number
  running: boolean
  finished: boolean
  start: () => void
  pause: () => void
  toggle: () => void
  reset: (seconds?: number) => void
}

/** Second-resolution countdown with tick sounds for the last five seconds. */
export function useCountdown(total: number, onFinish?: () => void): Countdown {
  const [remaining, setRemaining] = useState(total)
  const [running, setRunning] = useState(false)
  const finishedRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const reset = useCallback(
    (seconds?: number) => {
      finishedRef.current = false
      setRunning(false)
      setRemaining(seconds ?? total)
    },
    [total],
  )

  useEffect(() => reset(total), [total, reset])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        const next = r - 1
        if (next <= 5 && next > 0) sfx.tick()
        if (next <= 0) {
          window.clearInterval(id)
          setRunning(false)
          if (!finishedRef.current) {
            finishedRef.current = true
            sfx.timeUp()
            onFinishRef.current?.()
          }
          return 0
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  return {
    remaining,
    running,
    finished: remaining <= 0 && total > 0,
    start: () => remaining > 0 && setRunning(true),
    pause: () => setRunning(false),
    toggle: () => (running ? setRunning(false) : remaining > 0 && setRunning(true)),
    reset,
  }
}
