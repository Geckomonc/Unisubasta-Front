import { api } from './api'
import type { Bid, CreateBidPayload } from '@/types'

/**
 * Servicio de pujas. Migrado desde lib/data/services/bid_service.dart
 */
export const bidService = {
  async getByProduct(productId: number): Promise<Bid[]> {
    const { data } = await api.get<Bid[]>(`/bids/product/${productId}`)
    return data
  },

  /**
   * Pujas hechas por el usuario autenticado.
   * El backend identifica al usuario por el token Firebase del header,
   * por eso el path lleva la palabra mágica `me`.
   */
  async getMine(): Promise<Bid[]> {
    const { data } = await api.get<Bid[]>('/bids/user/me')
    return data
  },

  async create(payload: CreateBidPayload): Promise<Bid> {
    const { data } = await api.post<Bid>('/bids', payload)
    return data
  },
}
