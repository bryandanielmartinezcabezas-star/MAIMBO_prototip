import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'quiet'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container's width — for stacked toolbars and modal footers. */
  block?: boolean
  icon?: ReactNode
}

/**
 * The only button in the app. Both prototypes import this exact component and
 * differ purely through the stylesheet, which is what keeps them in sync.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
    </button>
  )
}
