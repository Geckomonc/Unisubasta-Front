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
 * Notas:
 *  - El backend identifica al usuario por el token Firebase del header,
 *    por eso `getMine()` llama a `/bids/user/me` sin pasar id explícito.
 *  - El WebSocket de pujas en vivo es opcional; si el backend no lo expone,
 *    se ignora silenciosamente y la app sigue funcionando con recarga manual.
 */
export function useBidsLive() {
  const [items, setItems] = useState<BidWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const buildBidWsUrl = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // WebSocket de pujas en vivo — opcional, no bloquea la app si falla
  useEffect(() => {
    const url = buildBidWsUrl()
    if (!url) return

    let cancelled = false
    let active = true

    const connect = async () => {
      const token = await auth.currentUser?.getIdToken()
      if (cancelled) return

      const finalUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url

      try {
        const ws = new WebSocket(finalUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (active) console.info('[useBidsLive] WS de pujas conectado')
        }

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(String(ev.data)) as BidUpdate
            if (!data.bid || !data.product) return

            setItems((prev) => {
              const next = [...prev]
              const idx = next.findIndex(
                (x) => x.product.id === data.product.id,
              )
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
          } catch {
            /* mensaje inválido — ignorar */
          }
        }

        // Silenciar error/close cuando el endpoint no existe en el backend.
        // Usamos console.info en vez de console.error para no ensuciar la
        // consola con un fallo conocido y no bloqueante.
        ws.onerror = () => {
          if (active) {
            console.info(
              '[useBidsLive] WS de pujas no disponible — solo recarga manual',
            )
          }
        }
        ws.onclose = () => {
          /* silencioso */
        }
      } catch {
        // ignore: si el endpoint no existe, simplemente no hay live updates
      }
    }

    void connect()

    return () => {
      cancelled = true
      active = false
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  return { items, loading, error, reload: loadInitial }
}
