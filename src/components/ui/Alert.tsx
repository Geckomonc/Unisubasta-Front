import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'error' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900',
  success:
    'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-200 dark:border-green-900',
  error:
    'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900',
  warning:
    'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:border-yellow-900',
}

export function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        'w-full rounded-md border px-4 py-3 text-sm',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </div>
  )
}
