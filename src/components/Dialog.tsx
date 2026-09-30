import { useEffect, useId, useRef } from 'react'
import { create } from 'zustand'
import { AlertTriangle, Info, type LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

type Tone = 'default' | 'danger'

interface DialogOptions {
  title: string
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` paints the confirm button red and focuses Cancel, so Enter never destroys anything by accident. */
  tone?: Tone
}

interface DialogRequest extends DialogOptions {
  kind: 'confirm' | 'alert'
  resolve: (ok: boolean) => void
}

/** Requests wait in a queue; the host shows the first one. */
const useDialogStore = create<{ queue: DialogRequest[] }>(() => ({ queue: [] }))

function open(kind: DialogRequest['kind'], opts: DialogOptions): Promise<boolean> {
  return new Promise((resolve) => useDialogStore.setState((s) => ({ queue: [...s.queue, { ...opts, kind, resolve }] })))
}

function close(ok: boolean) {
  const [current, ...rest] = useDialogStore.getState().queue
  if (!current) return
  useDialogStore.setState({ queue: rest })
  current.resolve(ok)
}

/** In-app replacement for window.confirm: resolves true on confirm, false on cancel, Escape or a backdrop click. */
export const confirmDialog = (opts: DialogOptions) => open('confirm', opts)

/** In-app replacement for window.alert: resolves once dismissed. */
export const alertDialog = (opts: Omit<DialogOptions, 'cancelLabel'>) => open('alert', opts).then(() => undefined)

const TONES: Record<Tone, { Icon: LucideIcon; color: string }> = {
  default: { Icon: Info, color: 'var(--color-purple)' },
  danger: { Icon: AlertTriangle, color: 'var(--color-red)' },
}

/** Mount once at the app root, after the routes, so dialogs sit above every page including the stage. */
export function DialogHost() {
  const current = useDialogStore((s) => s.queue[0])
  // Keep the last request on screen while the exit animation plays.
  const last = useRef(current)
  if (current) last.current = current
  const shown = current ?? last.current
  const titleId = useId()

  useEffect(() => {
    if (!current) return
    const returnFocus = document.activeElement as HTMLElement | null
    // Capture phase on window runs before the stage and game shortcut handlers, so keys can't leak past the dialog.
    // Default actions still run, so Tab moves focus and Enter/Space press the focused button.
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation()
      if (e.key === 'Escape') {
        e.preventDefault()
        close(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      returnFocus?.focus?.()
    }
  }, [current])

  const tone = TONES[shown?.tone ?? 'default']
  const danger = shown?.tone === 'danger'
  const isConfirm = shown?.kind === 'confirm'

  return (
    <Modal open={!!current} onClose={() => close(false)} role={isConfirm ? 'alertdialog' : 'dialog'} labelledBy={titleId} className="sm:max-w-md">
      {shown && (
        <>
          <div className="flex gap-4 items-start">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${tone.color} 16%, transparent)`, color: tone.color }}
            >
              <tone.Icon size={20} />
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <h2 id={titleId} className="text-lg font-semibold leading-snug break-words">
                {shown.title}
              </h2>
              {shown.message && <div className="text-fg/70 text-sm mt-1.5 leading-relaxed">{shown.message}</div>}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            {isConfirm && (
              <Button variant="secondary" onClick={() => close(false)} autoFocus={danger}>
                {shown.cancelLabel ?? 'Cancel'}
              </Button>
            )}
            <Button variant={danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus={!danger || !isConfirm}>
              {shown.confirmLabel ?? (isConfirm ? 'Confirm' : 'OK')}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
