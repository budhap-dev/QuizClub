/**
 * The host screen is a second window (usually on the laptop) that drives the stage on the big screen.
 * They talk over a BroadcastChannel: the stage owns every change to the game and sends its live state;
 * the host window only sends commands. Teams, scores and the quiz reach the host through the persisted
 * session store, which follows changes made in other windows.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StagePhase } from '@/types'

const CHANNEL = 'quizclub.stage'
const PING_MS = 1500
/** No word from the other side for this long means it has gone. */
const STALE_MS = 4000

export interface StageState {
  quizId: string
  index: number
  phase: StagePhase
  timer: { total: number; remaining: number; running: boolean }
  /** The answer the host locked in on this question, if any. */
  picked: number | null
  /** Teams already given this question's points (repeats on "name them all"). */
  awarded: string[]
  /** "Name them all" answers uncovered so far. */
  uncovered: number[]
  /** Whether the question's sound clip is playing; null when it has none. */
  audio: boolean | null
}

export type HostCommand =
  | { cmd: 'next' }
  | { cmd: 'prev' }
  | { cmd: 'reveal' }
  | { cmd: 'timer' }
  | { cmd: 'scores' }
  | { cmd: 'pick'; option: number }
  | { cmd: 'award'; teamId: string }
  | { cmd: 'bump'; teamId: string; delta: number }
  | { cmd: 'undo' }
  | { cmd: 'audio' }

type Message = { type: 'state'; state: StageState } | { type: 'ping' } | { type: 'bye' } | ({ type: 'command' } & HostCommand)

const supported = typeof BroadcastChannel !== 'undefined'

function useFreshness() {
  const [last, setLast] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const seen = useCallback(() => setLast(Date.now()), [])
  const gone = useCallback(() => setLast(0), [])
  return { connected: last > 0 && now - last < STALE_MS, seen, gone }
}

/** Stage side: publish `state` whenever it changes, answer pings, and run commands from the host window. */
export function useStageLink(state: StageState | null, onCommand: (c: HostCommand) => void) {
  const channel = useRef<BroadcastChannel | null>(null)
  const latest = useRef(state)
  latest.current = state
  const handler = useRef(onCommand)
  handler.current = onCommand
  const host = useFreshness()
  const { seen, gone } = host

  useEffect(() => {
    if (!supported || !state) return
    const ch = new BroadcastChannel(CHANNEL)
    channel.current = ch
    ch.onmessage = ({ data }: MessageEvent<Message>) => {
      if (data.type === 'bye') return gone()
      seen()
      if (data.type === 'ping' && latest.current) ch.postMessage({ type: 'state', state: latest.current } satisfies Message)
      if (data.type === 'command') handler.current(data)
    }
    return () => {
      ch.close()
      channel.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!state])

  const key = JSON.stringify(state)
  useEffect(() => {
    if (state) channel.current?.postMessage({ type: 'state', state } satisfies Message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { supported, connected: host.connected }
}

/** Host side: the stage's live state (null until it answers) and a way to send it commands. */
export function useHostLink() {
  const channel = useRef<BroadcastChannel | null>(null)
  const [state, setState] = useState<StageState | null>(null)
  const stage = useFreshness()
  const { seen } = stage

  useEffect(() => {
    if (!supported) return
    const ch = new BroadcastChannel(CHANNEL)
    channel.current = ch
    ch.onmessage = ({ data }: MessageEvent<Message>) => {
      if (data.type !== 'state') return
      seen()
      setState(data.state)
    }
    const ping = () => ch.postMessage({ type: 'ping' } satisfies Message)
    ping()
    const id = window.setInterval(ping, PING_MS)
    const bye = () => ch.postMessage({ type: 'bye' } satisfies Message)
    window.addEventListener('pagehide', bye)
    return () => {
      bye()
      window.clearInterval(id)
      window.removeEventListener('pagehide', bye)
      ch.close()
      channel.current = null
    }
  }, [seen])

  const send = (c: HostCommand) => channel.current?.postMessage({ type: 'command', ...c } satisfies Message)
  return { supported, connected: stage.connected, state, send }
}

/** Open (or bring forward) the host screen window. */
export function openHostScreen() {
  const w = window.open('/play/host', 'quizclub-host', 'popup,width=560,height=900')
  w?.focus()
}
