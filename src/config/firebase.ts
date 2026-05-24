import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { env } from './env'

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
}

// Evitar inicializaciones duplicadas (HMR de Vite)
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
// Sugerencia para el selector de cuenta de Google: solo dominio UdeA
googleProvider.setCustomParameters({
  hd: env.allowedEmailDomain,
  prompt: 'select_account',
})
