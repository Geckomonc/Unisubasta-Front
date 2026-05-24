import { useEffect, useState } from 'react'
import { productService } from '@/services'
import type { Product } from '@/types'

interface ProductWithImages extends Product {
  imageUrls: string[]
}

interface UseProductsResult {
  products: ProductWithImages[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * Carga los productos paginados + sus imágenes en paralelo.
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await productService.getAll()
      const enriched = await Promise.all(
        list.map(async (p) => ({
          ...p,
          imageUrls: await productService.getImageUrls(p.id),
        })),
      )
      setProducts(enriched)
    } catch (err) {
      console.error('[useProducts]', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return { products, loading, error, reload: load }
}
