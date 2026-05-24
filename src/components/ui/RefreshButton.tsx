import type { ButtonHTMLAttributes } from 'react'

interface RefreshButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

/**
 * Botón compacto de recarga (solo icono). En móvil suele ocultarse
 * porque la recarga se hace deslizando, así que pasarle
 * `className="hidden sm:inline-flex"` desde fuera.
 */
export function RefreshButton({
  loading = false,
  className = '',
  disabled,
  ...rest
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      title="Recargar"
      aria-label="Recargar"
      className={[
        'text-udea-verde-oscuro dark:text-udea-verde-claro hover:bg-surface inline-flex items-center justify-center rounded-full p-2 transition-colors',
        'disabled:cursor-wait disabled:opacity-60',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-udea-verde-claro',
        className,
      ].join(' ')}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={['h-5 w-5', loading ? 'animate-spin' : ''].join(' ')}
        aria-hidden
      >
        <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10H17.6A6 6 0 1 1 12 6c1.65 0 3.13.67 4.22 1.78L13 11h7V4z" />
      </svg>
    </button>
  )
}
