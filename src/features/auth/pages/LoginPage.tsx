import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import googleFavicon from '@/assets/images/google_favicon.png'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla de bienvenida con login Google + validacion dominio UdeA.
 * Layout simple sobre el fondo del tema, con dos blobs verdes difuminados
 * como acento decorativo. El logo es un icono de martillo (gavel).
 */
export function LoginPage() {
  const { isAuthenticated, isLoading, loginWithGoogle, error, status } = useAuth()

  useEffect(() => {
    document.title = 'Iniciar sesion - Unisubasta UdeA'
  }, [])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const submitting = isLoading && status === 'loading'

  return (
    <main className="bg-canvas relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-10">
      {/* Blobs verdes difuminados al fondo */}
      <div
        aria-hidden
        className="bg-udea-verde-claro/35 pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl dark:opacity-50"
      />
      <div
        aria-hidden
        className="bg-udea-verde-suave/70 dark:bg-udea-verde-oscuro/50 pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Logo de martillo (gavel) en un circulo verde */}
        <div className="bg-udea-verde-oscuro flex h-24 w-24 items-center justify-center rounded-full shadow-lg shadow-udea-verde-oscuro/20">
          <GavelIcon />
        </div>

        <h1 className="text-ink mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Bienvenido a Unisubasta
        </h1>

        <p className="text-ink-muted mt-4 max-w-sm text-base">
          Utiliza tu correo institucional UdeA para hacer parte de esta comunidad.
        </p>

        <button
          type="button"
          onClick={() => void loginWithGoogle()}
          disabled={submitting}
          className="bg-udea-verde-oscuro hover:bg-udea-verde-claro focus-visible:ring-udea-verde-claro mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-medium text-white shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <span
              aria-hidden
              className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"
            />
          ) : (
            <img src={googleFavicon} alt="" className="h-5 w-5 rounded-sm bg-white p-0.5 object-contain" />
          )}
          <span>{submitting ? 'Ingresando...' : 'Continua con Google'}</span>
        </button>

        {error && (
          <div className="mt-4 w-full text-left">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <p className="text-ink-soft mt-10 text-xs">
          Solo cuentas <strong className="text-ink-muted">@udea.edu.co</strong> pueden ingresar.
        </p>
      </div>
    </main>
  )
}

function GavelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white" aria-hidden>
      <path d="M1 21h12v2H1z" />
      <path d="M5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828z" />
      <path d="M12.317 1l5.657 5.656-2.83 2.83-5.654-5.66z" />
      <path d="M3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z" />
    </svg>
  )
}
