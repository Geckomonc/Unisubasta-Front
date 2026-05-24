import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/paths'
import { FullScreenLoader } from '@/components/layout/FullScreenLoader'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Envuelve rutas que requieren un usuario autenticado y registrado en el backend.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth()

  if (status === 'loading') return <FullScreenLoader />
  if (status !== 'authenticated') return <Navigate to={ROUTES.login} replace />

  return <>{children}</>
}
