/** Seven-segment slots for a digit cell 60 wide and 110 tall: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle. */
const SLOTS: Record<string, [number, number, number, number]> = {
  a: [10, 5, 50, 5],
  b: [55, 10, 55, 50],
  c: [55, 60, 55, 100],
  d: [10, 105, 50, 105],
  e: [5, 60, 5, 100],
  f: [5, 10, 5, 50],
  g: [10, 55, 50, 55],
}
const DIGITS: Record<string, string> = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' }
/** Operator cells are 56 wide: a horizontal stick, plus an upright for "+", or two horizontals for "=". */
const OPS: Record<string, [number, number, number, number][]> = {
  '+': [[8, 55, 48, 55], [28, 35, 28, 75]],
  '-': [[8, 55, 48, 55]],
  '=': [[8, 45, 48, 45], [8, 65, 48, 65]],
}

function Stick({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e9b35f" strokeWidth={6} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={5.5} fill="#e04848" />
    </g>
  )
}

/** A sum drawn in matchsticks. Empty digit slots show faintly so it's easy to see where a match could go. */
export function Matchsticks({ eq, className }: { eq: string; className?: string }) {
  let x = 0
  const cells = [...eq].map((ch, i) => {
    const left = x
    const digit = DIGITS[ch]
    x += (digit ? 60 : 56) + 16
    if (digit) {
      return (
        <g key={i} transform={`translate(${left} 0)`}>
          {Object.entries(SLOTS).map(([s, [x1, y1, x2, y2]]) =>
            digit.includes(s) ? null : <line key={s} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.08} strokeWidth={6} strokeLinecap="round" />,
          )}
          {Object.entries(SLOTS).map(([s, [x1, y1, x2, y2]]) => (digit.includes(s) ? <Stick key={s} x1={x1} y1={y1} x2={x2} y2={y2} /> : null))}
        </g>
      )
    }
    return (
      <g key={i} transform={`translate(${left} 0)`}>
        {(OPS[ch] ?? []).map(([x1, y1, x2, y2], k) => (
          <Stick key={k} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    )
  })
  const width = x - 16
  return (
    <svg viewBox={`-10 -6 ${width + 20} 122`} className={className} style={{ width: '100%', maxWidth: width * 1.6 }} role="img" aria-label={`Matchsticks: ${eq}`}>
      {cells}
    </svg>
  )
}
