/**
 * Modelo de producto/subasta. Migrado desde lib/data/models/product_model.dart
 */
export interface Product {
  id: number
  name: string
  description: string
  initialPrice: number
  currentPrice: number
  openingDate: string // ISO 8601
  closingDate: string // ISO 8601
  timerId: number
  sellerId: number
  buyerId: number | null
  productStateId: number
  availabilityStateId: number
  categoryId: number
}

/** Respuesta paginada de Spring Boot */
export interface ProductsPage {
  content: Product[]
  totalElements: number
  totalPages: number
  number: number // página actual
  size: number
}

export interface CreateProductPayload {
  name: string
  description: string
  initialPrice: number
  openingDate: string
  closingDate: string
  timerId: number
  categoryId: number
}

/** Imagen asociada a un producto (el GET por id devuelve el binario) */
export interface ProductImage {
  id: number
  productId?: number
}

/** Categorías del backend */
export const CATEGORIES = {
  libros: 1,
  ropa: 2,
  muebles: 3,
  computadores: 4,
  celulares: 5,
  vehiculos: 6,
  otros: 7,
} as const

export type CategoryKey = keyof typeof CATEGORIES
export type CategoryId = (typeof CATEGORIES)[CategoryKey]
