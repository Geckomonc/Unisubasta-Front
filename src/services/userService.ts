import { api } from './api'
import type { AppUser, UpdateProfilePayload } from '@/types'

/**
 * Servicio de usuarios. Migrado desde lib/data/services/user_service.dart
 */
export const userService = {
  /** GET /users/me — perfil del usuario autenticado */
  async getMe(): Promise<AppUser> {
    const { data } = await api.get<AppUser>('/users/me')
    return data
  },

  /** PATCH /users/me — actualiza datos del usuario actual */
  async updateMe(payload: UpdateProfilePayload): Promise<AppUser> {
    const { data } = await api.patch<AppUser>('/users/me', payload)
    return data
  },

  /** GET /users/:id — obtiene un usuario por su id SQL */
  async getById(id: number): Promise<AppUser> {
    const { data } = await api.get<AppUser>(`/users/${id}`)
    return data
  },

  /**
   * Asegura que el usuario exista en backend. Si no existe (404),
   * lo crea con un PATCH de bienvenida. Equivalente a `enviarUsuarioAlBackend`
   * en hello_screen.dart.
   */
  async ensureRegistered(defaultPhotoUrl?: string | null): Promise<AppUser | null> {
    try {
      return await this.getMe()
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        return this.updateMe({
          descripcionPersonal: 'Hola, soy un usuario de Unisubasta',
          urlFotoPerfil: defaultPhotoUrl ?? '',
        })
      }
      throw err
    }
  },

  /** Atajo: obtener idUsuario (id SQL) del usuario autenticado */
  async getMyId(): Promise<number | null> {
    try {
      const me = await this.getMe()
      return me.idUsuario ?? null
    } catch {
      return null
    }
  },
}
