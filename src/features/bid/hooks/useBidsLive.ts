import { useEffect, useRef, useState } from 'react'
import { auth } from '@/config/firebase'
import { env } from '@/config/env'
import { bidService, productService } from '@/services'
import type { Bid, Product } from '@/types'

export interface BidWithProduct {
  bid: Bid
  product: Product
  imageUrls: string[]
}

interface BidUpdate {
  bid: Bid
  product: Product
  imagenes?: string[]
}

/**
 * Carga las pujas del usuario + se suscribe a las actualizaciones por WebSocket.
 *
 * El backend expone un WebSocket "raw" (no STOMP) en
 *   {VITE_WS_URL_BIDS}/bid/create  o equivalente.
 *
 * Para mantenerlo configurable se reutiliza `env.wsUrl`. Si la URL termina
 * en `/ws` se intercambia por `/api/bid/create` (formato del Flutter actual).
 */
export function useBidsLive() {
  const [items, setItems] = useState<BidWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const buildBidWsUrl = () => {
    // Tomamos apiUrl y lo convertimos a ws(s)://.../api/bid/create
    const apiUrl = env.apiUrl
    try {
      const u = new URL(apiUrl)
      const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProto}//${u.host}${u.pathname.replace(/\/$/, '')}/api/bid/create`
    } catch {
      return ''
    }
  }

  const loadInitial = async () => {
    setLoading(true)
    setError(null)
    try {
      const bids = await bidService.getMine()

      // Solo la última puja por producto
      const lastByProduct = new Map<number, Bid>()
      for (const b of bids) {
        const prev = lastByProduct.get(b.productId)
        if (!prev || new Date(b.proposedAt) > new Date(prev.proposedAt)) {
          lastByProduct.set(b.productId, b)
        }
      }

      const enriched = await Promise.all(
        Array.from(lastByProduct.values()).map(async (b) => {
          const product = await productService.getById(b.productId)
          const imageUrls = await productService.getImageUrls(b.productId)
          return { bid: b, product, imageUrls }
        }),
      )
      setItems(enriched)
    } catch (err) {
      console.error('[useBidsLive] loadInitial', err)
      setError('Error al cargar tus pujas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInitial()

    const url = buildBidWsUrl()
    if (!url) return

    let cancelled = false

    const connect = async () => {
      const token = await auth.currentUser?.getIdToken()
      if (cancelled) return

      // El backend Flutter no enviaba token por header (limitación de WebSocket),
      // pero lo agregamos como query param por si el server lo lee.
      const finalUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url

      try {
        const ws = new WebSocket(finalUrl)
        wsRef.current = ws

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(String(ev.data)) as BidUpdate
            if (!data.bid || !data.product) return

            setItems((prev) => {
              const next = [...prev]
              const idx = next.findIndex((x) => x.product.id === data.product.id)
              const merged: BidWithProduct = {
                bid: data.bid,
                product: data.product,
                imageUrls:
                  data.imagenes && data.imagenes.length > 0
                    ? data.imagenes
                    : idx >= 0
                      ? next[idx].imageUrls
                      : [],
              }
              if (idx >= 0) next[idx] = merged
              else next.push(merged)
              return next
            })
          } catch (parseErr) {
            console.warn('[useBidsLive] mensaje WS no parseable', parseErr)
          }
        }

        ws.onerror = (e) => console.warn('[useBidsLive] WS error', e)
        ws.onclose = () => console.debug('[useBidsLive] WS cerrado')
      } catch (err) {
        console.warn('[useBidsLive] no se pudo abrir WS', err)
      }
    }

    void connect()

    return () => {
      cancelled = true
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  return { items, loading, error, reload: loadInitial }
}
