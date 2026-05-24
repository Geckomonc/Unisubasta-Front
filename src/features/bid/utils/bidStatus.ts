import type { Bid } from '@/types'

export type BidState = 'winning' | 'outbid' | 'none'

export interface BidStatus {
  /** Mi última puja en este producto (la más reciente / con mayor monto) */
  myLastBid: number | null
  state: BidState
  /** Cuánto me superan (currentPrice - myLastBid). 0 si voy ganando. */
  difference: number
  /** Monto mínimo válido para volver a pujar (currentPrice + 1) */
  minimumNext: number
  /** Sugerencias rápidas, redondeadas al millar */
  suggestions: number[]
}

/**
 * Calcula el estado del usuario en una subasta:
 *  - `winning`: mi última puja iguala al precio actual.
 *  - `outbid`: alguien me superó tras mi puja.
 *  - `none`: no he pujado en este producto.
 */
export function getBidStatus(
  bids: Bid[],
  myId: number | null,
  currentPrice: number,
): BidStatus {
  if (myId == null) {
    return {
      myLastBid: null,
      state: 'none',
      difference: 0,
      minimumNext: currentPrice + 1,
      suggestions: suggestedAmounts(currentPrice),
    }
  }

  const mine = bids.filter((b) => b.userId === myId)
  if (mine.length === 0) {
    return {
      myLastBid: null,
      state: 'none',
      difference: 0,
      minimumNext: currentPrice + 1,
      suggestions: suggestedAmounts(currentPrice),
    }
  }

  // La mayor puja propia es la relevante
  const myLastBid = Math.max(...mine.map((b) => b.proposedPrice))

  const state: BidState =
    myLastBid >= currentPrice ? 'winning' : 'outbid'

  return {
    myLastBid,
    state,
    difference: Math.max(0, currentPrice - myLastBid),
    minimumNext: currentPrice + 1,
    suggestions: suggestedAmounts(currentPrice),
  }
}

/**
 * Calcula 3 montos sugeridos sobre el precio actual:
 * +5 %, +10 %, +20 %, con un incremento mínimo de $1.000 y redondeados
 * al millar más cercano para que se vean limpios.
 */
export function suggestedAmounts(currentPrice: number): number[] {
  if (currentPrice <= 0) return [1000, 5000, 10000]
  const pcts = [0.05, 0.1, 0.2]
  const minInc = 1000
  return pcts.map((pct) => {
    const inc = Math.max(currentPrice * pct, minInc)
    return Math.ceil((currentPrice + inc) / 1000) * 1000
  })
}
