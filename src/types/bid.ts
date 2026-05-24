/**
 * Modelo de puja. Migrado desde lib/data/models/bid_model.dart
 */
export interface Bid {
  id: number
  productId: number
  userId: number
  proposedPrice: number
  proposedAt: string // ISO 8601
}

export interface CreateBidPayload {
  productId: number
  proposedPrice: number
}
