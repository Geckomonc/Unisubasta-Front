import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import logo from '@/assets/images/unisubasta_logo.png'
import googleFavicon from '@/assets/images/google_favicon.png'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla de bienvenida con login Google + validación dominio UdeA.
 * Diseño minimalista: fondo limpio segun tema, card centrada con sombras
 * suaves y dos blobs verdes desenfocados al fondo (acento sutil de marca).
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
    <main className="bg-canvas relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
      <div
        aria-hidden
        className="bg-udea-verde-claro/25 pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl dark:opacity-40"
      />
      <div
        aria-hidden
        className="bg-udea-verde-suave/60 dark:bg-udea-verde-oscuro/40 pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl"
      />

      <section className="bg-surface border-line relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-xl shadow-black/5 sm:p-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="bg-udea-verde-suave text-udea-verde-oscuro dark:bg-udea-verde-oscuro/30 dark:text-udea-verde-claro inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
              <path d="M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5z" />
            </svg>
            Universidad de Antioquia
          </span>

          <div className="bg-udea-verde-suave dark:bg-canvas ring-line flex h-24 w-24 items-center justify-center rounded-full ring-1">
            <img src={logo} alt="Unisubasta UdeA" className="h-16 w-16 object-contain" />
          </div>

          <div>
            <h1 className="text-ink text-2xl font-bold tracking-tight sm:text-3xl">
              Bienvenido a Unisubasta
            </h1>
            <p className="text-ink-muted mt-2 text-sm sm:text-base">
              La plataforma de subastas de la comunidad UdeA. Compra, vende y puja con tus companeros.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loginWithGoogle()}
            disabled={submitting}
            className="bg-surface border-line text-ink hover:border-udea-verde-claro hover:bg-surface-2 focus-visible:ring-udea-verde-claro inline-flex w-full items-center justify-center gap-3 rounded-full border-2 px-5 py-3 text-sm font-medium shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? (
              <span
                aria-hidden
                className="border-udea-verde-oscuro dark:border-udea-verde-claro h-5 w-5 animate-spin rounded-full border-2 border-r-transparent"
              />
            ) : (
              <img src={googleFavicon} alt="" className="h-5 w-5 object-contain" />
            )}
            <span>{submitting ? 'Ingresando...' : 'Continuar con Google'}</span>
          </button>

          {error && (
            <div className="w-full text-left">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <div className="border-line w-full border-t" />

          <p className="text-ink-soft text-xs">
            Solo cuentas con correo institucional{' '}
            <strong className="text-ink-muted">@udea.edu.co</strong> pueden ingresar.
          </p>
        </div>
      </section>

      <footer className="text-ink-soft absolute bottom-4 left-0 right-0 text-center text-xs">
        (c) {new Date().getFullYear()} Unisubasta UdeA
      </footer>
    </main>
  )
}
