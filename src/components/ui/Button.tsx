import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  leftIcon?: ReactNode
  fullWidth?: boolean
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-udea-verde-oscuro text-white hover:bg-udea-verde-claro focus-visible:ring-udea-verde-claro',
  secondary:
    'bg-surface text-udea-verde-oscuro dark:text-udea-verde-claro border border-udea-verde-oscuro hover:bg-udea-verde-suave dark:hover:bg-surface-2 focus-visible:ring-udea-verde-oscuro',
  ghost:
    'bg-transparent text-udea-verde-oscuro dark:text-udea-verde-claro hover:bg-udea-verde-suave dark:hover:bg-surface-2 focus-visible:ring-udea-verde-oscuro',
}

export function Button({
  variant = 'primary',
  leftIcon,
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5',
        'text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
    </button>
  )
}
