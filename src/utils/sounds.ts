/**
 * Tiny synthesised sound effects via the Web Audio API — no audio files needed.
 * All sounds respect the `muted` flag in the settings store.
 */
import { useSettingsStore } from '@/store/settingsStore'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, duration: number, opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {}) {
  if (useSettingsStore.getState().muted) return
  const ac = audio()
  if (!ac) return
  const { type = 'sine', gain = 0.15, delay = 0, slideTo } = opts
  const osc = ac.createOscillator()
  const g = ac.createGain()
  const t0 = ac.currentTime + delay
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export const sfx = {
  click: () => tone(600, 0.06, { type: 'triangle', gain: 0.08 }),
  tick: () => tone(1200, 0.05, { type: 'square', gain: 0.05 }),
  correct: () => {
    tone(523, 0.15, { type: 'triangle' })
    tone(659, 0.15, { type: 'triangle', delay: 0.12 })
    tone(784, 0.3, { type: 'triangle', delay: 0.24 })
  },
  wrong: () => {
    tone(220, 0.25, { type: 'sawtooth', gain: 0.1, slideTo: 110 })
  },
  reveal: () => {
    tone(440, 0.1, { type: 'triangle' })
    tone(880, 0.25, { type: 'triangle', delay: 0.1 })
  },
  timeUp: () => {
    tone(330, 0.2, { type: 'square', gain: 0.1 })
    tone(330, 0.2, { type: 'square', gain: 0.1, delay: 0.25 })
    tone(220, 0.5, { type: 'square', gain: 0.1, delay: 0.5 })
  },
  fanfare: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319]
    notes.forEach((n, i) => tone(n, 0.18, { type: 'triangle', delay: i * 0.13, gain: 0.14 }))
  },
  swoosh: () => tone(200, 0.2, { type: 'sine', gain: 0.08, slideTo: 800 }),
  point: () => tone(880, 0.12, { type: 'sine', gain: 0.12, slideTo: 1320 }),
  minus: () => tone(500, 0.15, { type: 'sine', gain: 0.1, slideTo: 250 }),
}
