import { useTheme } from '@/features/theme/useTheme'
import type { ThemePreference } from '@/store/themeStore'

interface Option {
  value: ThemePreference
  label: string
  icon: React.ReactNode
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0-5 2 3h-4zm0 17 2 3h-4zM2 12l3-2v4zm17 0 3-2v4zM4.93 4.93l3.18 1.41-1.42 1.42zm14.14 14.14-1.41-3.18 3.18 1.42zM4.93 19.07l1.41-3.18 1.42 3.18zM19.07 4.93l-3.18 1.41 1.42-1.42z" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
)

const SystemIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1m4 16h8v2H8z" />
  </svg>
)

const options: Option[] = [
  { value: 'light', label: 'Claro', icon: <SunIcon /> },
  { value: 'dark', label: 'Oscuro', icon: <MoonIcon /> },
  { value: 'system', label: 'Sistema', icon: <SystemIcon /> },
]

interface ThemeToggleProps {
  /** 'segment' = los 3 botones en fila. 'icon' = un solo botón que rota. */
  variant?: 'segment' | 'icon'
}

/**
 * Selector de tema. Variantes:
 *  - 'segment' (default): 3 botones (claro/oscuro/sistema), ideal para perfil.
 *  - 'icon': un botón compacto que alterna claro↔oscuro, ideal para el header.
 */
export function ThemeToggle({ variant = 'segment' }: ThemeToggleProps) {
  const { preference, setPreference, isDark } = useTheme()

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => setPreference(isDark ? 'light' : 'dark')}
        className="text-header-fg hover:bg-surface-2/40 rounded-full p-2 transition-colors"
        aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        title={isDark ? 'Tema claro' : 'Tema oscuro'}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la aplicación"
      className="border-line bg-surface-2 inline-flex gap-1 rounded-full border p-1"
    >
      {options.map((o) => {
        const selected = preference === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPreference(o.value)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selected
                ? 'bg-udea-verde-oscuro text-white shadow-sm'
                : 'text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
