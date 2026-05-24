import { api } from './api'
import { env } from '@/config/env'
import type {
  Product,
  ProductsPage,
  CreateProductPayload,
  ProductImage,
} from '@/types'

/**
 * Servicio de productos/subastas. Migrado desde lib/data/services/products_service.dart
 *
 * Notas del backend (Spring Boot):
 *  - GET /products devuelve `ProductsPage` (paginación clásica de Spring).
 *  - GET /products/by-seller/:id devuelve un array directo.
 *  - GET /products/images/:id devuelve el binario de la imagen; para mostrar
 *    en <img src>, se usa `getImageUrlById(id)`.
 */
export const productService = {
  async getAll(page = 0, size = 20): Promise<Product[]> {
    const { data } = await api.get<ProductsPage>('/products', {
      params: { page, size },
    })
    return data.content ?? []
  },

  async getPage(page = 0, size = 20): Promise<ProductsPage> {
    const { data } = await api.get<ProductsPage>('/products', {
      params: { page, size },
    })
    return data
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`)
    return data
  },

  async getBySeller(sellerId: number): Promise<Product[]> {
    const { data } = await api.get<Product[]>(`/products/by-seller/${sellerId}`)
    return data
  },

  async create(payload: CreateProductPayload & { sellerId: number }): Promise<Product> {
    const body = {
      id: 0,
      name: payload.name,
      description: payload.description,
      initialPrice: Math.trunc(payload.initialPrice),
      currentPrice: Math.trunc(payload.initialPrice),
      openingDate: payload.openingDate,
      closingDate: payload.closingDate,
      timerId: payload.timerId,
      sellerId: payload.sellerId,
      buyerId: null,
      productStateId: 1,
      availabilityStateId: 1,
      categoryId: payload.categoryId,
    }
    const { data } = await api.post<Product>('/products', body)
    return data
  },

  async updatePrice(productId: number, newPrice: number): Promise<void> {
    await api.patch(`/products/${productId}`, {
      initialPrice: Math.trunc(newPrice),
      currentPrice: Math.trunc(newPrice),
    })
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  // ============================================================
  // Imágenes
  // ============================================================

  async getImagesByProduct(productId: number): Promise<ProductImage[]> {
    const { data } = await api.get<ProductImage[]>(
      `/products/images/by-product/${productId}`,
    )
    return data
  },

  /** URL pública para `<img src>` (pasa por el proxy en dev) */
  getImageUrlById(imageId: number): string {
    return `${env.apiBase}/products/images/${imageId}`
  },

  async uploadImage(file: File, productId: number): Promise<void> {
    const form = new FormData()
    form.append('file', file)
    form.append('productId', String(productId))

    await api.post('/products/images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async deleteImage(imageId: number): Promise<void> {
    await api.delete(`/products/images/${imageId}`)
  },

  /** Elimina imágenes y luego el producto. Equivale a deleteProductWithImages. */
  async removeWithImages(productId: number): Promise<void> {
    const images = await this.getImagesByProduct(productId)
    for (const img of images) {
      await this.deleteImage(img.id)
    }
    await this.remove(productId)
  },

  // ============================================================
  // Helper: obtener URLs listas para <img>
  // ============================================================
  async getImageUrls(productId: number, fallback?: string): Promise<string[]> {
    try {
      const imgs = await this.getImagesByProduct(productId)
      if (imgs.length === 0) {
        return fallback ? [fallback] : []
      }
      return imgs.map((i) => this.getImageUrlById(i.id))
    } catch {
      return fallback ? [fallback] : []
    }
  },
}
