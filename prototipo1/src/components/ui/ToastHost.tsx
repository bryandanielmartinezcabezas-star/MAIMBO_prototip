import { useToast } from '../../store/ToastProvider'
import { Icon } from './Icon'

const ICON = { ok: 'check', error: 'alert', info: 'tag' } as const

export function ToastHost() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className={`toast toast--${t.tone}`} onClick={() => dismiss(t.id)}>
          <Icon name={ICON[t.tone]} size={15} />
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  )
}
