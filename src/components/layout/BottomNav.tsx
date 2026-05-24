import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
    <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" />
  </svg>
)

/** Mano levantada con billete = acción de "pujar" */
const BidHandIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
    {/* Billete */}
    <rect x="6" y="3" width="12" height="6" rx="1" />
    <circle cx="12" cy="6" r="1.4" fill="var(--nav-bg)" />
    {/* Brazo / mano sosteniendo el billete */}
    <path d="M9 11V8h2v3h1V8h2v4h1V9h2v6a6 6 0 0 1-6 6H8a4 4 0 0 1-3.79-2.74L2.6 14.43a1.5 1.5 0 0 1 2.66-1.37L7 15z" />
  </svg>
)

/** Martillo de subasta = "mis subastas" (yo soy quien adjudica) */
const GavelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
    {/* Base inferior */}
    <path d="M1 21h12v2H1z" />
    {/* Mazo */}
    <path d="M5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828z" />
    {/* Punta izquierda */}
    <path d="M12.317 1l5.657 5.656-2.83 2.83-5.654-5.66z" />
    {/* Punta derecha */}
    <path d="M3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z" />
  </svg>
)

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5" />
  </svg>
)

const items: NavItem[] = [
  { to: ROUTES.home, label: 'Inicio', icon: <HomeIcon /> },
  { to: ROUTES.bid, label: 'Pujar', icon: <BidHandIcon /> },
  { to: ROUTES.myAuctions, label: 'Mis subastas', icon: <GavelIcon /> },
  { to: ROUTES.profile, label: 'Perfil', icon: <PersonIcon /> },
]

/**
 * Barra inferior de navegación. Equivalente a BottomNavigationBar de Flutter.
 *
 * Responsive:
 *  - Mobile (< sm): solo iconos centrados (con label oculto pero accesible).
 *  - sm+: icono + texto en columna.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="bg-nav border-line-strong sticky bottom-0 border-t shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <ul className="mx-auto flex max-w-6xl items-stretch justify-around">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === ROUTES.home}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors sm:py-2',
                  isActive
                    ? 'text-nav-active font-semibold'
                    : 'text-nav-inactive hover:text-nav-active',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Pastilla detrás del icono cuando está activo (estilo moderno tipo Material You) */}
                  <span
                    className={[
                      'flex items-center justify-center rounded-full px-3 py-1 transition-colors',
                      isActive ? 'bg-udea-verde-suave dark:bg-surface-2' : '',
                    ].join(' ')}
                  >
                    {item.icon}
                  </span>
                  {/* Texto solo visible en sm+ */}
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
