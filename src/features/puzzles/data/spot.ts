import type { Puzzle, Scene, SceneEl } from '../types'

const rect = (x: number, y: number, width: number, height: number, fill: string, extra: Record<string, string | number> = {}): SceneEl => ['rect', { x, y, width, height, fill, ...extra }]
const circle = (cx: number, cy: number, r: number, fill: string, extra: Record<string, string | number> = {}): SceneEl => ['circle', { cx, cy, r, fill, ...extra }]
const poly = (points: string, fill: string): SceneEl => ['polygon', { points, fill }]
const path = (d: string, attrs: Record<string, string | number>): SceneEl => ['path', { d, ...attrs }]
const bird = (x: number, y: number, w = 14): SceneEl => path(`M${x},${y} q${w / 2},-${w / 2} ${w},0 q${w / 2},-${w / 2} ${w},0`, { fill: 'none', stroke: '#2b2d42', strokeWidth: 2.5, strokeLinecap: 'round' })

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? inner : outer
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

const HOUSE: Scene = {
  items: [
    ['sky', rect(0, 0, 400, 300, '#bfe3ff')],
    ['sun', circle(340, 55, 28, '#ffcf3f')],
    ['cloud1', ['ellipse', { cx: 92, cy: 62, rx: 42, ry: 17, fill: '#ffffff' }]],
    ['cloud2', ['ellipse', { cx: 118, cy: 50, rx: 28, ry: 20, fill: '#ffffff' }]],
    ['grass', rect(0, 215, 400, 85, '#7cc65a')],
    ['path', poly('185,225 215,225 238,300 162,300', '#e2cc9c')],
    ['chimney', rect(235, 86, 18, 36, '#8d4a3a')],
    ['house', rect(130, 130, 140, 95, '#f4d6a0')],
    ['roof', poly('118,136 200,74 282,136', '#c8553d')],
    ['door', rect(185, 170, 30, 55, '#8a5a3b', { rx: 2 })],
    ['knob', circle(209, 199, 2.5, '#f4d6a0')],
    ['win1', rect(145, 150, 28, 28, '#8fd3ff', { stroke: '#ffffff', strokeWidth: 3 })],
    ['win2', rect(227, 150, 28, 28, '#8fd3ff', { stroke: '#ffffff', strokeWidth: 3 })],
    ['trunk', rect(52, 165, 14, 55, '#7a4b2a')],
    ['treetop', circle(59, 148, 33, '#3e9a4a')],
    ['flower1', circle(300, 238, 7, '#ff6fa8')],
    ['flower2', circle(325, 250, 7, '#ff6fa8')],
    ['flower3', circle(350, 236, 7, '#ff6fa8')],
  ],
  differences: [
    { at: [200, 197, 32], set: { door: rect(185, 170, 30, 55, '#3b6fb6', { rx: 2 }) }, label: 'The door is blue' },
    { at: [241, 164, 28], set: { win2: null }, label: 'A window is missing' },
    { at: [59, 148, 40], set: { treetop: circle(59, 148, 33, '#e08a2c') }, label: 'The tree has turned orange' },
    { at: [376, 252, 24], set: { flower4: circle(376, 252, 7, '#ff6fa8') }, label: 'There’s an extra flower' },
  ],
}

const BEACH: Scene = {
  items: [
    ['sky', rect(0, 0, 400, 300, '#9fd8f5')],
    ['sun', circle(60, 55, 26, '#ffd23f')],
    ['bird1', bird(150, 62, 16)],
    ['bird2', bird(200, 88)],
    ['sea', rect(0, 150, 400, 70, '#2f8fd0')],
    ['waves', path('M0,172 q25,-10 50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0', { fill: 'none', stroke: '#cfeaff', strokeWidth: 3 })],
    ['mast', ['line', { x1: 280, y1: 140, x2: 280, y2: 78, stroke: '#5a3a1a', strokeWidth: 4 }]],
    ['sail', poly('284,82 284,134 326,134', '#ffffff')],
    ['hull', poly('230,138 334,138 316,160 246,160', '#8b5a2b')],
    ['sand', rect(0, 215, 400, 85, '#f1d391')],
    ['pole', ['line', { x1: 110, y1: 172, x2: 110, y2: 272, stroke: '#555555', strokeWidth: 4 }]],
    ['canopy', path('M58,186 Q110,134 162,186 Z', { fill: '#ff5a5f' })],
    ['stripe', path('M94,186 Q110,146 126,186 Z', { fill: '#ffffff' })],
    ['ball', circle(228, 262, 17, '#ffe066')],
    ['ballstripe', ['ellipse', { cx: 228, cy: 262, rx: 17, ry: 6, fill: '#3aa0ff' }]],
    ['bucket', poly('290,240 314,240 310,270 294,270', '#3ec27a')],
    ['starfish', poly(starPoints(352, 266, 15, 6), '#ff8c42')],
  ],
  differences: [
    { at: [304, 112, 30], set: { sail: poly('284,82 284,134 326,134', '#ffb703') }, label: 'The sail is yellow' },
    { at: [260, 40, 24], set: { bird3: bird(246, 44) }, label: 'There’s an extra bird' },
    { at: [110, 168, 28], set: { stripe: null }, label: 'The umbrella has lost its stripe' },
    { at: [228, 262, 24], set: { ballstripe: ['ellipse', { cx: 228, cy: 262, rx: 17, ry: 6, fill: '#ff5a5f' }] }, label: 'The ball’s stripe is red' },
    { at: [352, 266, 24], set: { starfish: null }, label: 'The starfish has gone' },
  ],
}

const SPACE: Scene = {
  items: [
    ['sky', rect(0, 0, 400, 300, '#14183a')],
    ...(
      [
        [30, 30], [150, 42], [240, 28], [380, 30], [120, 120], [40, 140], [372, 168], [262, 252], [140, 272], [352, 282],
      ] as const
    ).map(([x, y], i): [string, SceneEl] => [`s${i}`, circle(x, y, 2.2, '#ffffff')]),
    ['planet', circle(300, 90, 40, '#e7a35b')],
    ['planetband', ['ellipse', { cx: 300, cy: 80, rx: 37, ry: 6, fill: '#cf8640' }]],
    ['ring', ['ellipse', { cx: 300, cy: 92, rx: 64, ry: 14, fill: 'none', stroke: '#f5d7a1', strokeWidth: 5 }]],
    ['moon', circle(70, 232, 34, '#cfd3dc')],
    ['c1', circle(58, 220, 6, '#aab0bd')],
    ['c2', circle(84, 244, 8, '#aab0bd')],
    ['c3', circle(82, 212, 4, '#aab0bd')],
    ['flame', poly('188,220 200,252 212,220', '#ffb703')],
    ['finL', poly('181,192 164,226 181,220', '#e63946')],
    ['finR', poly('219,192 236,226 219,220', '#e63946')],
    ['body', rect(180, 140, 40, 82, '#eef1f5', { rx: 8 })],
    ['nose', poly('180,146 200,100 220,146', '#e63946')],
    ['window', circle(200, 168, 10, '#4cc9f0', { stroke: '#8a96a8', strokeWidth: 3 })],
    ['comet', ['line', { x1: 332, y1: 212, x2: 384, y2: 190, stroke: '#ffffff', strokeWidth: 2, strokeLinecap: 'round', opacity: 0.7 }]],
    ['cometHead', circle(332, 212, 4, '#ffffff')],
  ],
  differences: [
    { at: [200, 168, 18], set: { window: circle(200, 168, 10, '#ffd166', { stroke: '#8a96a8', strokeWidth: 3 }) }, label: 'The rocket window is yellow' },
    { at: [200, 248, 24], set: { flame: poly('188,220 200,272 212,220', '#ffb703') }, label: 'The flame is longer' },
    { at: [300, 80, 26], set: { planetband: null }, label: 'The stripe on the planet has gone' },
    { at: [84, 244, 15], set: { c2: null }, label: 'A crater is missing' },
    { at: [120, 120, 16], set: { s4: null }, label: 'A star is missing' },
    { at: [252, 186, 16], set: { s10: circle(252, 186, 2.2, '#ffffff') }, label: 'There’s an extra star' },
  ],
}

const spot = (level: Puzzle['level'], scene: Scene, where: string): Puzzle => ({
  type: 'spot',
  level,
  q: `Find the ${scene.differences.length} differences ${where}. Tap them on either picture.`,
  figure: { kind: 'spot', scene },
  answer: `${scene.differences.length} differences`,
  why: scene.differences.map((d) => d.label).join(' · '),
})

export const SPOT: Puzzle[] = [spot('easy', HOUSE, 'at the house'), spot('medium', BEACH, 'on the beach'), spot('hard', SPACE, 'in space')]
