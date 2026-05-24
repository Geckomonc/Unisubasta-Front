/**
 * Variables de entorno tipadas y validadas.
 * Toda lectura de `import.meta.env.*` debe pasar por aquí.
 */

interface AppEnv {
  /** URL absoluta del backend (usada para WS y para producción) */
  apiUrl: string
  /**
   * Base que usa el axios client.
   * - En dev: '/api' (el proxy de Vite lo reenvía al backend → evita CORS)
   * - En prod: `${apiUrl}/api`
   */
  apiBase: string
  wsUrl: string
  allowedEmailDomain: string
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
}

function requireEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback
  if (!value) {
    // No lanzamos en build para permitir despliegues estáticos parciales,
    // pero sí avisamos en consola para detectar variables faltantes.
    console.warn(`[env] Variable ${key} no definida.`)
    return ''
  }
  return value
}

const apiUrl = requireEnv(
  'VITE_API_URL',
  'https://codefact.udea.edu.co/unisubastas',
)

export const env: AppEnv = {
  apiUrl,
  apiBase: import.meta.env.DEV ? '/api' : `${apiUrl}/api`,
  wsUrl: requireEnv('VITE_WS_URL', 'wss://codefact.udea.edu.co/unisubastas/ws-chat'),
  allowedEmailDomain: requireEnv('VITE_ALLOWED_EMAIL_DOMAIN', 'udea.edu.co'),
  firebase: {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
  },
}
