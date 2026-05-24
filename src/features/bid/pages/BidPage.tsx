import { useMemo } from 'react'
import { useBidsLive } from '../hooks/useBidsLive'
import { ProductCard } from '@/components/ui/ProductCard'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla "Pujar": mis pujas activas, actualizadas en vivo por WebSocket.
 * Migrada desde lib/presentation/screens/main/pujar_screen.dart
 *
 * Marca claramente cuándo el usuario va GANANDO (verde) y cuándo lo
 * SUPERARON (naranja), con la diferencia exacta en pesos.
 */
export function BidPage() {
  const { items, loading, error, reload } = useBidsLive()

  const { winning, outbid } = useMemo(() => {
    let w = 0
    let o = 0
    for (const it of items) {
      const current = it.product.currentPrice ?? it.bid.proposedPrice
      if (it.bid.proposedPrice >= current) w++
      else o++
    }
    return { winning: w, outbid: o }
  }, [items])

  return (
    <PullToRefresh onRefresh={reload}>
      <section className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
            Mis pujas
          </h1>
          <RefreshButton
            onClick={() => void reload()}
            loading={loading}
            className="hidden sm:inline-flex"
          />
        </header>

        {/* Resumen rápido del estado de mis pujas */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Pill color="emerald">
              Vas ganando: <strong className="ml-1">{winning}</strong>
            </Pill>
            <Pill color="orange">
              Te superaron: <strong className="ml-1">{outbid}</strong>
            </Pill>
          </div>
        )}

        {loading && (
          <p className="text-ink-soft py-10 text-center">Cargando tus pujas…</p>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-ink-soft py-10 text-center">
            No has realizado ninguna puja
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(({ bid, product, imageUrls }) => {
            const current = product.currentPrice ?? bid.proposedPrice
            const isWinning = bid.proposedPrice >= current
            const diff = isWinning ? 0 : current - bid.proposedPrice

            return (
              <ProductCard
                key={product.id}
                to={ROUTES.productDetail(product.id)}
                name={product.name}
                description={product.description}
                currentPrice={current}
                images={imageUrls}
                bid={{
                  state: isWinning ? 'winning' : 'outbid',
                  myAmount: bid.proposedPrice,
                  difference: diff,
                }}
              />
            )
          })}
        </div>

        {/* Leyenda de colores, ayuda al usuario nuevo */}
        {items.length > 0 && (
          <p className="text-ink-soft mt-2 text-center text-xs">
            Verde = vas ganando · Naranja = te superaron — toca la tarjeta para
            pujar de nuevo
          </p>
        )}
      </section>
    </PullToRefresh>
  )
}

function Pill({
  color,
  children,
}: {
  color: 'emerald' | 'orange'
  children: React.ReactNode
}) {
  const cls =
    color === 'emerald'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
      : 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200'
  return (
    <span
      className={['inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', cls].join(
        ' ',
      )}
    >
      {children}
    </span>
  )
}
