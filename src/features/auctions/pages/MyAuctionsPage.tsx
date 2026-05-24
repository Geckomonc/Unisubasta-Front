import { Link } from 'react-router-dom'
import { useMyProducts } from '../hooks/useMyProducts'
import { ProductCard } from '@/components/ui/ProductCard'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla "Mis subastas": productos publicados por el usuario.
 * Migrada desde lib/presentation/screens/main/mis_subastas_screen.dart
 */
export function MyAuctionsPage() {
  const { products, loading, error, reload } = useMyProducts()

  return (
    <PullToRefresh onRefresh={reload}>
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
          Mis subastas
        </h1>
        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={() => void reload()}
            loading={loading}
            className="hidden sm:inline-flex"
          />
          <Link
            to={ROUTES.newProduct}
            className="bg-udea-verde-claro hover:bg-udea-verde-oscuro inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white transition-colors sm:px-4"
            aria-label="Nuevo producto"
            title="Nuevo producto"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
            </svg>
            <span className="hidden sm:inline">Nuevo producto</span>
          </Link>
        </div>
      </header>

      {loading && (
        <p className="text-ink-soft py-10 text-center">
          Cargando tus subastas…
        </p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-ink-soft py-10 text-center">
          Aún no has publicado productos.{' '}
          <Link
            to={ROUTES.newProduct}
            className="text-udea-verde-oscuro dark:text-udea-verde-claro font-medium underline"
          >
            Publicar el primero
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            to={ROUTES.editAuction(p.id)}
            name={p.name}
            description={p.description}
            currentPrice={p.currentPrice ?? p.initialPrice}
            images={p.imageUrls}
          />
        ))}
      </div>
    </section>
    </PullToRefresh>
  )
}
