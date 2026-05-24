import { useContext } from 'react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { useAuthStore } from '@/store/authStore'

/**
 * Hook principal para acceder al estado y acciones de autenticación.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }

  const firebaseUser = useAuthStore((s) => s.firebaseUser)
  const appUser = useAuthStore((s) => s.appUser)
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)

  return {
    firebaseUser,
    appUser,
    /** Id SQL del usuario en backend Unisubasta (alias de `appUser?.idUsuario`). */
    myId: appUser?.idUsuario ?? null,
    status,
    error,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    ...ctx,
  }
}
