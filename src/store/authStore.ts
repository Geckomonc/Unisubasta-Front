import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import type { AppUser } from '@/types'

/**
 * Estado global de autenticación.
 *
 * - `firebaseUser`: el usuario de Firebase (token, uid, email...)
 * - `appUser`: el perfil de nuestro backend Unisubasta
 * - `status`: ciclo de vida del bootstrap (loading mientras Firebase hidrata, etc.)
 */
export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

interface AuthState {
  firebaseUser: FirebaseUser | null
  appUser: AppUser | null
  status: AuthStatus
  error: string | null
  setFirebaseUser: (user: FirebaseUser | null) => void
  setAppUser: (user: AppUser | null) => void
  setStatus: (status: AuthStatus) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  status: 'loading',
  error: null,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setAppUser: (appUser) => set({ appUser }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      firebaseUser: null,
      appUser: null,
      status: 'unauthenticated',
      error: null,
    }),
}))
