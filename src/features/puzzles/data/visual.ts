import type { Glyph, Puzzle, RebusToken } from '../types'

const MOVE: Record<'move' | 'add' | 'remove', (n: number) => string> = {
  move: (n) => `Move ${n === 1 ? 'one match' : 'two matches'} to make the sum correct.`,
  add: () => 'Add one match to make the sum correct.',
  remove: () => 'Take away one match to make the sum correct.',
}

const match = (level: Puzzle['level'], eq: string, mode: keyof typeof MOVE, n: number, fixed: string, why: string, hint?: string): Puzzle => ({
  type: 'matchsticks',
  level,
  q: MOVE[mode](n),
  figure: { kind: 'matchsticks', eq },
  answer: fixed.replace(/-/g, ' − ').replace(/\+/g, ' + ').replace(/=/g, ' = '),
  answerFigure: { kind: 'matchsticks', eq: fixed },
  why,
  hint,
})

export const MATCHSTICKS: Puzzle[] = [
  match('easy', '1+2=4', 'move', 1, '1+3=4', 'Move the bottom-left match of the 2 to its bottom-right to make a 3.'),
  match('easy', '4-1=5', 'move', 1, '4-1=3', 'Move the top-left match of the 5 over to the right to make a 3.'),
  match('easy', '1+5=5', 'add', 1, '1+5=6', 'One more match in the bottom-left of the last 5 turns it into a 6.'),
  match('easy', '3+3=8', 'remove', 1, '3+3=6', 'Take the top-right match from the 8 to leave a 6.'),
  match('medium', '5+7=2', 'move', 1, '9-7=2', 'Take the upright match of the plus (leaving a minus) and add it to the 5 to make a 9.', 'The answer is right. Look at the sign.'),
  match('medium', '7+1=0', 'move', 1, '7-7=0', 'The upright of the plus becomes the top of a new 7.', 'Change the sign.'),
  match('medium', '0+4=12', 'add', 1, '8+4=12', 'Add a match across the middle of the 0 to make an 8.'),
  match('medium', '6+4=4', 'move', 1, '0+4=4', 'Move the middle match of the 6 to its top-right to make a 0. (8 − 4 = 4 works too: move the plus’s upright into the 6.)'),
  match('hard', '10+10=8', 'move', 1, '18-10=8', 'Take the upright of the plus and put it inside the first 0 to make 18 − 10 = 8.', 'Change the sign, and a number.'),
  match('hard', '6-5=7', 'move', 2, '2+5=7', 'Take the top-left and bottom-right matches off the 6: one goes to its top-right to make a 2, the other becomes the upright of a plus.', 'The 6 has spare matches.'),
  match('hard', '8-1=3', 'move', 2, '9-7=2', 'Take one match from the 8 to make a 9, use it to turn the 1 into a 7, and move one match within the 3 to make a 2.', 'All three numbers change.'),
]

const arrow = (rot: number): Glyph => ({ shape: 'arrow', rot })
const g = (shape: Extract<Glyph, { shape: string }>['shape'], extra: Omit<Extract<Glyph, { shape: string }>, 'shape'> = {}): Glyph => ({ shape, ...extra })
const mini = (...on: number[]): Glyph => ({ grid: 3, on })

export const PATTERNS: Puzzle[] = [
  {
    type: 'patterns',
    level: 'easy',
    q: 'Which arrow comes next?',
    figure: { kind: 'glyphs', items: [arrow(0), arrow(45), arrow(90), arrow(135), null] },
    options: [arrow(90), arrow(180), arrow(225), arrow(0)],
    answerIndex: 1,
    why: 'The arrow turns 45° clockwise each time.',
  },
  {
    type: 'patterns',
    level: 'easy',
    q: 'Which shape is missing?',
    figure: { kind: 'glyphs', items: [g('triangle'), g('square'), null, g('hexagon')] },
    options: [g('circle'), g('pentagon'), g('octagon'), g('star')],
    answerIndex: 1,
    why: 'Each shape has one more side: 3, 4, 5, 6.',
  },
  {
    type: 'patterns',
    level: 'easy',
    q: 'What comes next?',
    figure: { kind: 'glyphs', items: [g('circle', { fill: 'solid' }), g('square', { fill: 'empty' }), g('circle', { fill: 'solid' }), g('square', { fill: 'empty' }), null] },
    options: [g('square', { fill: 'solid' }), g('circle', { fill: 'empty' }), g('circle', { fill: 'solid' }), g('triangle', { fill: 'solid' })],
    answerIndex: 2,
    why: 'Shapes alternate: shaded circle, empty square.',
  },
  {
    type: 'patterns',
    level: 'medium',
    q: 'Which picture completes the grid?',
    figure: {
      kind: 'glyphs',
      cols: 3,
      items: [
        g('circle', { fill: 'solid' }), g('circle', { fill: 'half' }), g('circle', { fill: 'empty' }),
        g('square', { fill: 'half' }), g('square', { fill: 'empty' }), g('square', { fill: 'solid' }),
        g('triangle', { fill: 'empty' }), g('triangle', { fill: 'solid' }), null,
      ],
    },
    options: [g('triangle', { fill: 'solid' }), g('triangle', { fill: 'half' }), g('square', { fill: 'half' }), g('triangle', { fill: 'empty' })],
    answerIndex: 1,
    why: 'Each row keeps one shape and uses each shading once: solid, half and empty.',
  },
  {
    type: 'patterns',
    level: 'medium',
    q: 'What comes next?',
    figure: { kind: 'glyphs', items: [mini(0, 4), mini(1), mini(2, 4), mini(5), null] },
    options: [mini(8, 4), mini(8), mini(7, 4), mini(5, 4)],
    answerIndex: 0,
    why: 'The edge square walks clockwise round the border one step at a time, and the centre square blinks on and off.',
    hint: 'Watch the two squares separately.',
  },
  {
    type: 'patterns',
    level: 'medium',
    q: 'What time comes next?',
    figure: { kind: 'clocks', times: ['3:00', '4:10', '5:20', '6:30', null] },
    options: ['7:30', '7:40', '8:40', '7:50'],
    answerIndex: 1,
    why: 'Each clock is 1 hour and 10 minutes later than the one before.',
  },
  {
    type: 'patterns',
    level: 'hard',
    q: 'In each row, the first two pictures combine to make the third. Which completes the grid?',
    figure: {
      kind: 'glyphs',
      cols: 3,
      items: [mini(0, 4), mini(4, 8), mini(0, 8), mini(1, 3), mini(3, 5, 7), mini(1, 5, 7), mini(2, 4, 6), mini(0, 4), null],
    },
    options: [mini(0, 2, 6), mini(0, 2, 4, 6), mini(2, 6), mini(0, 2, 6, 8)],
    answerIndex: 0,
    why: 'Overlay the first two: a square shaded in just one of them stays shaded, but where both are shaded, it disappears.',
    hint: 'What happens to the middle square in the first row?',
  },
  {
    type: 'patterns',
    level: 'hard',
    q: 'Which arrow comes next?',
    figure: { kind: 'glyphs', items: [arrow(0), arrow(45), arrow(135), arrow(270), null] },
    options: [arrow(90), arrow(180), arrow(315), arrow(0)],
    answerIndex: 0,
    why: 'The turn grows each time: 45°, 90°, 135°, then 180° — which brings it round to pointing right.',
    hint: 'The arrow isn’t turning by the same amount each time.',
  },
  {
    type: 'patterns',
    level: 'hard',
    q: 'Which picture completes the grid?',
    figure: {
      kind: 'glyphs',
      cols: 3,
      items: [
        g('circle', { dots: 1 }), g('square', { dots: 2 }), g('triangle', { dots: 3 }),
        g('square', { dots: 3 }), g('triangle', { dots: 1 }), g('circle', { dots: 2 }),
        g('triangle', { dots: 2 }), g('circle', { dots: 3 }), null,
      ],
    },
    options: [g('square', { dots: 1 }), g('square', { dots: 3 }), g('circle', { dots: 1 }), g('triangle', { dots: 1 })],
    answerIndex: 0,
    why: 'Every row and column has one circle, one square and one triangle, and one, two and three dots.',
  },
]

/** Straight lines on a 100-unit canvas, as [x1, y1, x2, y2]. */
type Seg = [number, number, number, number]
const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const segs = (...pts: [[number, number], [number, number]][]): Seg[] => pts.map(([a, b]) => [a[0], a[1], b[0], b[1]])

/** A triangle with lines fanning from the top to the base, and optional cross lines. */
function fan(cuts: number, crosses: number): Seg[] {
  const A: [number, number] = [50, 4]
  const B: [number, number] = [4, 92]
  const C: [number, number] = [96, 92]
  const out = segs([A, B], [B, C], [C, A])
  for (let i = 1; i < cuts + 1; i++) out.push(...segs([A, lerp(B, C, i / (cuts + 1))]))
  for (let i = 1; i < crosses + 1; i++) out.push(...segs([lerp(A, B, i / (crosses + 1)), lerp(A, C, i / (crosses + 1))]))
  return out
}

function grid(cols: number, rows: number): Seg[] {
  const s = Math.min(92 / cols, 92 / rows)
  const out: Seg[] = []
  for (let r = 0; r <= rows; r++) out.push([4, 4 + r * s, 4 + cols * s, 4 + r * s])
  for (let c = 0; c <= cols; c++) out.push([4 + c * s, 4, 4 + c * s, 4 + rows * s])
  return out
}

const square = segs([[4, 4], [96, 4]], [[96, 4], [96, 96]], [[96, 96], [4, 96]], [[4, 96], [4, 4]])
const diagonals = segs([[4, 4], [96, 96]], [[96, 4], [4, 96]])
const middles = segs([[50, 4], [50, 96]], [[4, 50], [96, 50]])

function star(withPentagon: boolean): Seg[] {
  const p = Array.from({ length: 5 }, (_, i): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return [50 + 46 * Math.cos(a), 52 + 46 * Math.sin(a)]
  })
  const out = p.flatMap((_, i) => segs([p[i], p[(i + 2) % 5]]))
  if (withPentagon) out.push(...p.flatMap((_, i) => segs([p[i], p[(i + 1) % 5]])))
  return out
}

const count = (level: Puzzle['level'], what: 'triangles' | 'squares' | 'rectangles', lines: Seg[], answer: number, why: string, hint?: string, height = 100): Puzzle => ({
  type: 'counting',
  level,
  q: what === 'rectangles' ? 'How many rectangles can you find? (Squares count too.)' : `How many ${what} can you find?`,
  figure: { kind: 'lines', segments: lines, height },
  answer: String(answer),
  why,
  hint,
})

export const COUNTING: Puzzle[] = [
  count('easy', 'triangles', fan(2, 0), 6, '3 small ones, 2 made of two pieces, and the big one: 3 + 2 + 1 = 6.'),
  count('easy', 'triangles', [...square, ...diagonals], 8, '4 small triangles meet in the middle, and each diagonal splits the square into 2 big ones: 4 + 4 = 8.'),
  count('easy', 'squares', grid(3, 3), 14, '9 small squares, 4 two-by-two squares and the big one: 9 + 4 + 1 = 14.'),
  count('medium', 'triangles', fan(2, 1), 12, 'The top part alone has 6 triangles (like a fan of three), and the whole shape has another 6: 12.', 'Cover the bottom part first.'),
  count('medium', 'triangles', [...square, ...diagonals, ...middles], 16, '8 small triangles, 4 made from two small ones along the edges, and 4 made from four small ones (half the square): 8 + 4 + 4 = 16.', 'Start with the smallest.'),
  count('medium', 'rectangles', grid(3, 2), 18, 'Choose any 2 of the 3 horizontal lines (3 ways) and any 2 of the 4 vertical lines (6 ways): 3 × 6 = 18.', 'Each rectangle is two horizontal lines and two vertical ones.', 70),
  count('hard', 'triangles', star(true), 35, 'They come in five sizes: the 5 star points, the 5 slim triangles along the edges, 10 of the next size, 10 bigger ones, and 5 big triangles that each stand on one edge of the pentagon: 5 + 5 + 10 + 10 + 5 = 35.', 'Work round the star one type at a time.'),
  count('hard', 'squares', grid(4, 4), 30, '16 one-by-one, 9 two-by-two, 4 three-by-three and the whole grid: 16 + 9 + 4 + 1 = 30.'),
  count('hard', 'triangles', fan(3, 2), 30, 'Each of the three bands counts as a fan of four sections, which holds 10 triangles: 3 × 10 = 30.', 'Every triangle has the top point or sits on a cross line.'),
]

const R = (...rows: (string | RebusToken)[][]): Puzzle['figure'] => ({ kind: 'rebus', rows: rows.map((r) => r.map((t) => (typeof t === 'string' ? { t } : t))) })
const rebus = (level: Puzzle['level'], figure: Puzzle['figure'], answer: string, why?: string): Puzzle => ({
  type: 'rebus',
  level,
  q: 'What phrase does this picture show?',
  figure,
  answer,
  why,
  hint: 'Look at where the words are, and how they’re written.',
})

export const REBUS: Puzzle[] = [
  rebus('easy', R(['MIND'], ['MATTER']), 'Mind over matter', '“Mind” is over “matter”.'),
  rebus('easy', R(['HEAD'], ['HEELS']), 'Head over heels'),
  rebus('easy', R(['DICE', 'DICE']), 'Paradise', 'A pair of dice — “pair-a-dice”.'),
  rebus('easy', R(['CYCLE', 'CYCLE', 'CYCLE']), 'Tricycle', 'Three cycles.'),
  rebus('easy', R([{ t: 'DEAL', style: 'big' }]), 'Big deal'),
  rebus('medium', R(['STAND'], ['I']), 'I understand', '“I” is under “stand”.'),
  rebus('medium', R([{ t: 'GLANCE', style: 'reverse' }]), 'Backward glance'),
  rebus('medium', R([{ t: 'TOWN', style: 'down' }]), 'Downtown', '“Town” is written going down.'),
  rebus('medium', R([{ t: '', style: 'rule' }], ['READING'], [{ t: '', style: 'rule' }]), 'Reading between the lines'),
  rebus('medium', R(['IT’S A', { t: 'world', style: 'small' }]), 'It’s a small world'),
  rebus('medium', R(['GO', 'IT', 'IT', 'IT', 'IT']), 'Go for it', '“Go” and four “it”s — go four it.'),
  rebus('medium', R(['MILL1ON']), 'One in a million', 'There’s a 1 in “million”.'),
  rebus('hard', R(['TRAVEL'], ['C   C   C']), 'Travel overseas', '“Travel” is over the Cs (seas).'),
  rebus('hard', R(['YOU', 'JUST', 'ME']), 'Just between you and me'),
  rebus('hard', R([{ t: 'HE|ART', style: 'split' }]), 'Broken heart'),
  rebus('hard', R(['ARREST'], ['YOU’RE']), 'You’re under arrest'),
  rebus('hard', R(['GROUND'], ['FEET FEET FEET'], ['FEET FEET FEET']), 'Six feet underground'),
  rebus('hard', R(['HE’S', 'HIMSELF']), 'He’s beside himself', '“He’s” is beside “himself”.'),
]
