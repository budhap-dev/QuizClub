// Renders the share card and app icons in public/ with headless Chrome.
// Run: node scripts/share-assets/render.mjs  (needs Google Chrome installed and a network connection for the fonts)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../../public')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME=/path/to/chrome`)
mkdirSync(out, { recursive: true })

const shots = [
  ['card.html', 'og-image.png', 1200, 630],
  ['icon.html?size=180&mode=full', 'apple-touch-icon.png', 180, 180],
  ['icon.html?size=192&mode=tile', 'icon-192.png', 192, 192],
  ['icon.html?size=512&mode=tile', 'icon-512.png', 512, 512],
  ['icon.html?size=512&mode=maskable', 'icon-maskable-512.png', 512, 512],
  ['icon.html?size=32&mode=tile', 'favicon-32.png', 32, 32],
]

for (const [page, file, w, h] of shots) {
  const url = pathToFileURL(join(here, page.split('?')[0])).href + (page.includes('?') ? '?' + page.split('?')[1] : '')
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', `--window-size=${w},${h}`, '--virtual-time-budget=8000',
    `--screenshot=${join(out, file)}`, url,
  ], { stdio: 'ignore' })
  console.log('wrote public/' + file)
}
