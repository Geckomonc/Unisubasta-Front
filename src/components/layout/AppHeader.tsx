import { Link } from 'react-router-dom'
import martilloLogo from '@/assets/images/martillo_logo.png'
import { ROUTES } from '@/routes/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/**
 * Cabecera principal. Equivalente a TituloAppBar de Flutter.
 *
 * Responsive:
 *  - Mobile (< sm): solo logo + saludo oculto + iconos compactos.
 *  - sm+: logo + título "Unisubasta UdeA" + saludo + botón logout con texto.
 */
export function AppHeader() {
  const { appUser, firebaseUser, logout } = useAuth()
  const displayName = appUser?.nombre ?? firebaseUser?.displayName ?? 'Usuario'

  return (
    <header className="bg-header text-header-fg border-line-strong border-b shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to={ROUTES.home}
          className="flex items-center gap-2"
          aria-label="Ir al inicio — Unisubasta UdeA"
        >
          <span className="bg-surface flex h-9 w-9 items-center justify-center rounded-full p-1.5 shadow-sm">
            <img
              src={martilloLogo}
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
          {/* Título solo visible en pantallas medianas o más grandes */}
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Unisubasta UdeA
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden text-sm opacity-90 sm:inline">
            Hola, <strong>{displayName}</strong>
          </span>

          <ThemeToggle variant="icon" />

          <button
            type="button"
            onClick={() => void logout()}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="hover:bg-surface/30 inline-flex items-center gap-1.5 rounded-full p-2 text-sm font-medium transition-colors sm:rounded-md sm:px-3 sm:py-1.5"
          >
            <LogoutIcon />
            {/* Texto solo visible en sm+ */}
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M16 17v-3H9v-4h7V7l5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    </svg>
  )
}
