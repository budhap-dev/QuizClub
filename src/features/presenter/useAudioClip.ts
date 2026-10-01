import { useCallback, useEffect, useRef, useState } from 'react'

export interface AudioClip {
  playing: boolean
  /** 0–1 through the clip. */
  progress: number
  toggle: () => void
  stop: () => void
}

/** Plays a question's sound clip; stops and rewinds when the question changes. */
export function useAudioClip(url?: string): AudioClip | null {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    if (!url) return
    const el = new Audio(url)
    el.preload = 'auto'
    ref.current = el
    const onTime = () => setProgress(el.duration ? el.currentTime / el.duration : 0)
    const onPlay = () => setPlaying(true)
    const onStop = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setProgress(0)
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onStop)
    el.addEventListener('ended', onEnded)
    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
      ref.current = null
    }
  }, [url])

  const toggle = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      if (el.ended) el.currentTime = 0
      void el.play().catch(() => setPlaying(false))
    } else el.pause()
  }, [])
  const stop = useCallback(() => ref.current?.pause(), [])

  return url ? { playing, progress, toggle, stop } : null
}
