import { api } from './api'

/**
 * Servicio de temporizadores. Migrado desde lib/data/services/timers_service.dart
 */
export const timerService = {
  /** PUT /products/timers → devuelve el id del timer creado */
  async create(milliseconds: number): Promise<number> {
    const { data } = await api.put<{ id: number }>('/products/timers', {
      id: 0,
      timer: milliseconds,
    })
    return data.id
  },
}
