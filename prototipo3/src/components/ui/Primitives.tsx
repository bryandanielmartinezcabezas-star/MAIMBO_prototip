/** Small shared building blocks. Same API in every prototype; only the CSS changes. */

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'

/* ------------------------------------------------------------------ inputs */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Field({ label, hint, className = '', ...rest }: FieldProps) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span className="field__label">{label}</span>}
      <input className="field__input" {...rest} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
}

export function SelectField({ label, options, className = '', ...rest }: SelectFieldProps) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span className="field__label">{label}</span>}
      <select className="field__input field__input--select" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchBox({
  value,
  onValueChange,
  placeholder = 'Buscar...',
}: {
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="searchbox">
      <Icon name="search" size={16} />
      <input
        className="searchbox__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button className="searchbox__clear" onClick={() => onValueChange('')} aria-label="Limpiar">
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ display */

export function EmptyState({
  icon = 'box',
  title,
  detail,
  action,
}: {
  icon?: IconName
  title: string
  detail?: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={26} />
      </span>
      <p className="empty__title">{title}</p>
      {detail && <p className="empty__detail">{detail}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  )
}

export function StatTile({
  label,
  value,
  detail,
  icon,
  emphasis = false,
}: {
  label: string
  value: string
  detail?: string
  icon?: IconName
  /** Marks the single figure that matters most on the screen. */
  emphasis?: boolean
}) {
  return (
    <article className={`tile ${emphasis ? 'tile--emphasis' : ''}`.trim()}>
      <header className="tile__head">
        <span className="tile__label">{label}</span>
        {icon && <Icon name={icon} size={15} className="tile__icon" />}
      </header>
      <p className="tile__value">{value}</p>
      {detail && <p className="tile__detail">{detail}</p>}
    </article>
  )
}

/** Product photo with a graceful fallback when the file is missing. */
export function Thumb({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <img
      className={`thumb ${className}`.trim()}
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
  )
}
