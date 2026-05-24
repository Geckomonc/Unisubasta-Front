import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import logo from '@/assets/images/unisubasta_logo.png'
import googleFavicon from '@/assets/images/google_favicon.png'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla de bienvenida con login Google + validación dominio UdeA.
 * Migrada desde lib/presentation/screens/hello_screen.dart
 */
export function LoginPage() {
  const { isAuthenticated, isLoading, loginWithGoogle, error, status } = useAuth()

  // Limpiar el flag de bootstrap si llegamos aquí desautenticados
  useEffect(() => {
    document.title = 'Iniciar sesión · Unisubasta UdeA'
  }, [])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  return (
    <main className="bg-udea-verde-claro flex min-h-dvh items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center text-center text-white">
        <img
          src={logo}
          alt="Logo Unisubasta UdeA"
          className="mb-6 h-44 w-44 object-contain drop-shadow-lg"
        />

        <h1 className="text-3xl font-bold leading-tight">
          Bienvenido a Unisubasta
        </h1>

        <p className="mt-6 text-base text-white/90">
          Utiliza tu correo institucional UdeA para hacer parte de esta comunidad.
        </p>

        <div className="mt-8 w-full">
          <Button
            variant="primary"
            fullWidth
            loading={isLoading && status === 'loading'}
            onClick={() => void loginWithGoogle()}
            leftIcon={
              <img
                src={googleFavicon}
                alt=""
                className="h-5 w-5 rounded-sm bg-white object-contain p-0.5"
              />
            }
          >
            Continúa con Google
          </Button>
        </div>

        {error && (
          <div className="mt-6 w-full">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <p className="mt-10 text-xs text-white/70">
          Solo cuentas <strong>@udea.edu.co</strong> pueden ingresar.
        </p>
      </div>
    </main>
  )
}
