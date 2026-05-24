import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { auth } from '@/config/firebase'
import { env } from '@/config/env'

/**
 * Cliente HTTP central. Adjunta el ID token de Firebase a cada petición.
 *
 * En desarrollo `env.apiBase` = '/api' → pasa por el proxy de Vite y evita CORS.
 * En producción `env.apiBase` = `${VITE_API_URL}/api`.
 */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiBase,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Devolvemos el error tal cual para que cada servicio decida cómo manejarlo.
    // En el futuro: si 401, se podría hacer signOut() global.
    return Promise.reject(error)
  },
)
