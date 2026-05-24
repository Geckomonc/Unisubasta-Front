import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'

/**
 * Wrappers de Firebase Auth para el login con Google y cierre de sesión.
 *
 * Equivalente a las funciones `_signInWithGoogle` de hello_screen.dart,
 * pero usando popup (recomendado para SPA web).
 */
export const authService = {
  async signInWithGoogle(): Promise<FirebaseUser> {
    const credential = await signInWithPopup(auth, googleProvider)
    return credential.user
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },
}
