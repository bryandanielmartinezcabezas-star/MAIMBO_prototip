/**
 * Transient feedback. Kept separate from the store so the domain never has to
 * know how a message gets shown — each prototype renders its own toast host.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastTone = 'ok' | 'error' | 'info'

export interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastContextValue {
  toasts: Toast[]
  notify(message: string, tone?: ToastTone): void
  dismiss(id: number): void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const LIFETIME_MS = 2600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++
      // Keep the stack short so the counter never disappears behind messages.
      setToasts((prev) => [...prev.slice(-2), { id, tone, message }])
      window.setTimeout(() => dismiss(id), LIFETIME_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
