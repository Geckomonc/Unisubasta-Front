import { createContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services'
import { authService } from '@/features/auth/services/authService'
import { isInstitutionalEmail, getAllowedDomainLabel } from '@/features/auth/utils/validateEmail'

interface AuthContextValue {
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Proveedor de autenticación. Escucha cambios de Firebase y sincroniza
 * el perfil del backend en el store de Zustand.
 *
 * Reglas (replican el flujo de hello_screen.dart):
 *  1. El correo debe pertenecer a {VITE_ALLOWED_EMAIL_DOMAIN}.
 *  2. Tras login, se hace GET /users/me; si 404, PATCH para registrar.
 *  3. Si algo falla, se cierra la sesión y se reporta el error.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser)
  const setAppUser = useAuthStore((s) => s.setAppUser)
  const setStatus = useAuthStore((s) => s.setStatus)
  const setError = useAuthStore((s) => s.setError)
  const reset = useAuthStore((s) => s.reset)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        reset()
        return
      }

      // Validar dominio institucional
      if (!isInstitutionalEmail(firebaseUser.email)) {
        setError(`Solo correos institucionales ${getAllowedDomainLabel()} pueden ingresar`)
        await authService.signOut()
        reset()
        return
      }

      setFirebaseUser(firebaseUser)
      setStatus('loading')

      try {
        const appUser = await userService.ensureRegistered(firebaseUser.photoURL)
        if (!appUser) {
          throw new Error('No se pudo obtener el perfil del backend')
        }
        setAppUser(appUser)
        setStatus('authenticated')
        setError(null)
      } catch (err) {
        console.error('[auth] Error sincronizando con backend:', err)
        setError('Hubo un error registrando el usuario en los servidores')
        await authService.signOut()
        reset()
      }
    })

    return () => unsub()
  }, [reset, setAppUser, setError, setFirebaseUser, setStatus])

  const value = useMemo<AuthContextValue>(
    () => ({
      loginWithGoogle: async () => {
        setError(null)
        setStatus('loading')
        try {
          await authService.signInWithGoogle()
          // El resto se maneja en onAuthStateChanged
        } catch (err) {
          console.error('[auth] Error en signInWithGoogle:', err)
          setError('No se pudo iniciar sesión con Google')
          setStatus('unauthenticated')
        }
      },
      logout: async () => {
        await authService.signOut()
      },
    }),
    [setError, setStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
