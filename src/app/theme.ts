import { useSettingsStore } from '@/store/settingsStore'

export type ThemeId = 'neon' | 'ocean' | 'sunset' | 'forest' | 'retro' | 'midnight' | 'candy' | 'daylight' | 'coastal' | 'sunrise' | 'lilac' | 'meadow'

export interface ThemeMeta {
  id: ThemeId
  name: string
  description: string
  /** Light themes flip the page background and text colour. */
  light?: boolean
  /** Fixed swatch colours for the picker (the picker must show each theme's own look). */
  preview: { ink: string; fg: string; a: string; b: string; c: string; d: string }
}

/** Palette values live in index.css under `:root[data-theme=…]`; keep these previews in sync. */
export const THEMES: ThemeMeta[] = [
  { id: 'neon', name: 'Neon Night', description: 'Pink, purple and cyan on deep indigo', preview: { ink: '#12082e', fg: '#ffffff', a: '#ff4d8d', b: '#a855f7', c: '#22d3ee', d: '#a3e635' } },
  { id: 'ocean', name: 'Deep Ocean', description: 'Blues and teals with a navy backdrop', preview: { ink: '#061a2e', fg: '#ffffff', a: '#38bdf8', b: '#6366f1', c: '#2dd4bf', d: '#86efac' } },
  { id: 'sunset', name: 'Sunset', description: 'Coral, orange and gold on plum', preview: { ink: '#2b0a1e', fg: '#ffffff', a: '#fb7185', b: '#f97316', c: '#fbbf24', d: '#fde047' } },
  { id: 'forest', name: 'Forest', description: 'Emerald and lime on dark green', preview: { ink: '#071f16', fg: '#ffffff', a: '#34d399', b: '#10b981', c: '#a3e635', d: '#d9f99d' } },
  { id: 'retro', name: 'Retro Arcade', description: 'Loud 80s neons on near-black', preview: { ink: '#0d0221', fg: '#ffffff', a: '#ff2e97', b: '#7b2cff', c: '#00f0ff', d: '#c8ff00' } },
  { id: 'midnight', name: 'Midnight Mono', description: 'Calm silver and slate, minimal colour', preview: { ink: '#0a0a0f', fg: '#f4f4f5', a: '#a1a1aa', b: '#9ca3af', c: '#d4d4d8', d: '#bbf7d0' } },
  { id: 'candy', name: 'Candy Pop', description: 'Light mode — bright accents on pastel pink', light: true, preview: { ink: '#fff4fa', fg: '#2d1240', a: '#ff3d8b', b: '#9333ea', c: '#0891b2', d: '#65a30d' } },
  { id: 'daylight', name: 'Daylight', description: 'Light mode — crisp white with bold, professional accents', light: true, preview: { ink: '#f8fafc', fg: '#0f172a', a: '#db2777', b: '#6d28d9', c: '#0e7490', d: '#4d7c0f' } },
  { id: 'coastal', name: 'Coastal', description: 'Light mode — sea blues and teals on pale aqua', light: true, preview: { ink: '#f0fafa', fg: '#0b3b3c', a: '#0369a1', b: '#0f766e', c: '#0891b2', d: '#4d7c0f' } },
  { id: 'sunrise', name: 'Sunrise', description: 'Light mode — coral and amber on warm cream', light: true, preview: { ink: '#fff7ed', fg: '#431407', a: '#e11d48', b: '#ea580c', c: '#0d9488', d: '#65a30d' } },
  { id: 'lilac', name: 'Lilac', description: 'Light mode — violet and fuchsia on soft lavender', light: true, preview: { ink: '#f5f3ff', fg: '#2e1065', a: '#c026d3', b: '#7c3aed', c: '#2563eb', d: '#16a34a' } },
  { id: 'meadow', name: 'Meadow', description: 'Light mode — fresh greens on pale mint', light: true, preview: { ink: '#f0fdf4', fg: '#052e16', a: '#db2777', b: '#15803d', c: '#0891b2', d: '#65a30d' } },
]

export const DEFAULT_THEME: ThemeId = 'neon'

export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0]

export function applyTheme(id: ThemeId) {
  const root = document.documentElement
  const meta = themeById(id)
  root.dataset.theme = id
  root.style.colorScheme = meta.light ? 'light' : 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta.preview.ink)
}

/** Apply the persisted theme before first paint and keep it in sync with the settings store. */
export function initTheme() {
  applyTheme(useSettingsStore.getState().theme)
  useSettingsStore.subscribe((s, prev) => {
    if (s.theme !== prev.theme) applyTheme(s.theme)
  })
}

/** Resolve a theme colour at call time for JS consumers (canvas confetti etc.). */
export function themeColor(name: string, fallback = '#ffffff'): string {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim() || fallback
}
