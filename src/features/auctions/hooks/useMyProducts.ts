import { useEffect, useState } from 'react'
import { productService } from '@/services'
import type { Product } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

export interface ProductWithImages extends Product {
  imageUrls: string[]
}

/**
 * Carga las subastas del usuario autenticado (por idUsuario).
 */
export function useMyProducts() {
  const { myId } = useAuth()
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (myId == null) return
    setLoading(true)
    setError(null)
    try {
      const list = await productService.getBySeller(myId)
      const enriched = await Promise.all(
        list.map(async (p) => ({
          ...p,
          imageUrls: await productService.getImageUrls(p.id),
        })),
      )
      setProducts(enriched)
    } catch (err) {
      console.error('[useMyProducts]', err)
      setError('Error al cargar tus subastas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // recargar cuando cambie myId (por ejemplo, tras login)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  return { products, loading, error, reload: load }
}
