export function uid(prefix = ''): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return prefix ? `${prefix}_${rnd}` : rnd
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T)
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export const TEAM_COLORS = [
  '#ff4d8d',
  '#a855f7',
  '#22d3ee',
  '#a3e635',
  '#fbbf24',
  '#fb923c',
  '#34d399',
  '#f43f5e',
  '#60a5fa',
  '#e879f9',
]

export const TEAM_EMOJIS = ['🦁', '🐯', '🐸', '🦊', '🐼', '🦄', '🐙', '🦖', '🐧', '🦋', '🐨', '🦩', '🐲', '🦈', '🐝', '🦜']

export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

/** One theme accent per answer slot; the stage tints the tile with it and fills it on reveal. */
export const OPTION_COLORS = [
  'var(--color-pink)',
  'var(--color-purple)',
  'var(--color-cyan)',
  'var(--color-lime)',
  'var(--color-sun)',
  'var(--color-mint)',
]
