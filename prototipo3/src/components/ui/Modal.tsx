import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Wider variant for the product form, which carries a size grid. */
  wide?: boolean
}

export function Modal({ open, title, subtitle, onClose, children, footer, wide }: ModalProps) {
  // Escape closes, and the page behind must not scroll while the dialog is up.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal__scrim" onClick={onClose} />
      <div className={`modal__panel ${wide ? 'modal__panel--wide' : ''}`.trim()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
