import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '@/components/ui/ProductCard'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla Inicio: listado de productos disponibles.
 * Migrada desde lib/presentation/screens/main/inicio_screen.dart
 */
export function HomePage() {
  const { products, loading, error, reload } = useProducts()
  const { myId } = useAuth()

  return (
    <PullToRefresh onRefresh={reload}>
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
          Productos disponibles
        </h1>
        <RefreshButton
          onClick={() => void reload()}
          loading={loading}
          className="hidden sm:inline-flex"
        />
      </header>

      {loading && (
        <p className="text-ink-soft py-10 text-center">Cargando productos…</p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-ink-soft py-10 text-center">
          No hay productos disponibles
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const isMine = myId !== null && p.sellerId === myId
          const to = isMine ? ROUTES.editAuction(p.id) : ROUTES.productDetail(p.id)

          return (
            <ProductCard
              key={p.id}
              to={to}
              name={p.name}
              description={p.description}
              currentPrice={p.currentPrice ?? p.initialPrice}
              images={p.imageUrls}
              ribbon={isMine ? 'Mi subasta' : undefined}
            />
          )
        })}
      </div>
    </section>
    </PullToRefresh>
  )
}
