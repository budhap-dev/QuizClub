import confetti from 'canvas-confetti'
import { themeColor } from '@/app/theme'

/** Confetti is drawn on a canvas, so resolve the theme's accents at fire time. */
const colors = () => ['pink', 'purple', 'cyan', 'lime', 'sun', 'orange'].map((n) => themeColor(n))

export function burst(x = 0.5, y = 0.6) {
  void confetti({ particleCount: 90, spread: 70, origin: { x, y }, colors: colors(), zIndex: 100 })
}

export function celebrate() {
  const c = colors()
  const end = Date.now() + 2500
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: c, zIndex: 100 })
    void confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: c, zIndex: 100 })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function fireworks() {
  const c = colors()
  const duration = 4000
  const end = Date.now() + duration
  const tick = () => {
    void confetti({
      particleCount: 40,
      startVelocity: 35,
      spread: 360,
      ticks: 80,
      origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.1 },
      colors: c,
      zIndex: 100,
    })
    if (Date.now() < end) setTimeout(tick, 350)
  }
  tick()
}
