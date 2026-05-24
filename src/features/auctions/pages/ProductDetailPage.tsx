import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bidService, productService } from '@/services'
import type { Bid, Product } from '@/types'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCOP, formatDateTime } from '@/utils/formatters'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getBidStatus } from '@/features/bid/utils/bidStatus'
import { ROUTES } from '@/routes/paths'

/**
 * Detalle de un producto con historial de pujas y formulario para pujar.
 * Migrada desde lib/presentation/screens/detalle_producto_screen.dart
 *
 * Si el usuario ya pujó en este producto, muestra un banner que le dice
 * si va ganando o si lo superaron, además de sugerencias rápidas de
 * cuánto pujar para volver a quedar arriba.
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()
  const { myId } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [bidding, setBidding] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState<string | null>(null)

  const load = async () => {
    if (Number.isNaN(productId)) return
    setLoading(true)
    setError(null)
    try {
      const [p, imgs, bs] = await Promise.all([
        productService.getById(productId),
        productService.getImageUrls(productId),
        bidService.getByProduct(productId).catch(() => []),
      ])
      setProduct(p)
      setImages(imgs)
      setBids(bs)
    } catch (err) {
      console.error('[ProductDetailPage]', err)
      setError('No se pudo cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const currentPrice = product
    ? (product.currentPrice ?? product.initialPrice)
    : 0
  const bidStatus = useMemo(
    () => getBidStatus(bids, myId, currentPrice),
    [bids, myId, currentPrice],
  )

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setBidError(null)
    setBidSuccess(null)
    if (!product) return

    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setBidError('Ingresa una cantidad válida')
      return
    }
    if (value <= currentPrice) {
      setBidError(`La puja debe ser mayor a ${formatCOP(currentPrice)}`)
      return
    }
    if (product.sellerId === myId) {
      setBidError('No puedes pujar en tu propia subasta')
      return
    }

    setBidding(true)
    try {
      const created = await bidService.create({
        productId: product.id,
        proposedPrice: Math.trunc(value),
      })
      setBidSuccess('Puja realizada con éxito')
      setAmount('')
      setProduct({ ...product, currentPrice: created.proposedPrice })
      setBids((prev) => [created, ...prev])
    } catch (err) {
      console.error('[ProductDetailPage.bid]', err)
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) setBidError('La puja no es válida')
      else if (status === 401) setBidError('Debes iniciar sesión')
      else if (status === 404) setBidError('Producto no encontrado')
      else setBidError('Error inesperado al pujar')
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return <p className="text-ink-soft py-10 text-center">Cargando producto…</p>
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-md">
        <Alert variant="error">{error ?? 'Producto no encontrado'}</Alert>
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => navigate(ROUTES.home)}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const isMine = product.sellerId === myId
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.proposedAt).getTime() - new Date(a.proposedAt).getTime(),
  )

  return (
    <article className="bg-surface border-line mx-auto grid max-w-5xl gap-6 rounded-2xl border p-6 shadow-[var(--shadow-card)] lg:grid-cols-2">
      <ImageCarousel images={images} alt={product.name} />

      <div className="flex flex-col gap-4">
        <h1 className="text-ink text-3xl font-bold">{product.name}</h1>
        <p className="text-ink-muted">{product.description}</p>

        <div className="bg-udea-verde-suave dark:bg-surface-2 border-udea-verde-claro/30 flex flex-col gap-1 rounded-xl border p-4">
          <span className="text-ink-muted text-sm">Precio actual</span>
          <span className="text-udea-verde-oscuro dark:text-udea-verde-claro text-3xl font-bold">
            {formatCOP(currentPrice)}
          </span>
          <span className="text-ink-soft text-xs">
            Inicia: {formatDateTime(product.openingDate)} · Cierra:{' '}
            {formatDateTime(product.closingDate)}
          </span>
        </div>

        {/* Banner del estado del usuario en esta subasta */}
        {!isMine && bidStatus.state !== 'none' && (
          <UserBidBanner
            state={bidStatus.state}
            myAmount={bidStatus.myLastBid ?? 0}
            currentPrice={currentPrice}
            difference={bidStatus.difference}
          />
        )}

        {isMine ? (
          <Alert variant="info">
            Esta es tu propia subasta. Puedes editarla desde{' '}
            <a
              href={ROUTES.editAuction(product.id)}
              className="underline"
              onClick={(e) => {
                e.preventDefault()
                navigate(ROUTES.editAuction(product.id))
              }}
            >
              Mis subastas
            </a>
            .
          </Alert>
        ) : (
          <form onSubmit={handleBid} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-muted font-medium">Tu puja (COP)</span>
              <input
                type="number"
                min={bidStatus.minimumNext}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Más de ${formatCOP(currentPrice)}`}
                className="bg-surface-2 border-line text-ink focus:border-udea-verde-claro focus:ring-udea-verde-claro/30 rounded-xl border px-3 py-2 text-sm focus:ring focus:outline-none"
                required
              />
            </label>

            {/* Sugerencias rápidas — siempre disponibles, ayudan a no pujar de menos */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink-soft text-xs">Sugerencias:</span>
              {bidStatus.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAmount(String(s))}
                  className="border-line bg-surface-2 hover:border-udea-verde-claro hover:text-udea-verde-oscuro dark:hover:text-udea-verde-claro rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                >
                  {formatCOP(s)}
                </button>
              ))}
            </div>

            {bidError && <Alert variant="error">{bidError}</Alert>}
            {bidSuccess && <Alert variant="success">{bidSuccess}</Alert>}
            <Button type="submit" loading={bidding} fullWidth>
              {bidStatus.state === 'outbid' ? 'Volver a pujar' : 'Pujar'}
            </Button>
          </form>
        )}

        <section className="mt-4">
          <h2 className="text-udea-verde-oscuro dark:text-udea-verde-claro mb-2 text-lg font-bold">
            Historial de pujas
          </h2>
          {sortedBids.length === 0 ? (
            <p className="text-ink-soft text-sm">Aún no hay pujas.</p>
          ) : (
            <ul className="border-line divide-line divide-y rounded-xl border">
              {sortedBids.map((b) => {
                const mine = b.userId === myId
                return (
                  <li
                    key={b.id}
                    className={[
                      'flex items-center justify-between px-3 py-2 text-sm',
                      mine ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : '',
                    ].join(' ')}
                  >
                    <span className="text-ink-muted">
                      {formatDateTime(b.proposedAt)}
                      {mine && (
                        <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          tuya
                        </span>
                      )}
                    </span>
                    <span className="text-udea-verde-oscuro dark:text-udea-verde-claro font-semibold">
                      {formatCOP(b.proposedPrice)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </article>
  )
}

/**
 * Banner que aparece arriba del formulario indicando el estado del usuario:
 *  - winning: verde con "Vas ganando".
 *  - outbid: naranja con "Te superaron por $X. Puja al menos $Y".
 */
function UserBidBanner({
  state,
  myAmount,
  currentPrice,
  difference,
}: {
  state: 'winning' | 'outbid'
  myAmount: number
  currentPrice: number
  difference: number
}) {
  if (state === 'winning') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
        <span className="bg-emerald-500 text-white inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-200">
            ¡Vas ganando esta subasta!
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Tu puja de <strong>{formatCOP(myAmount)}</strong> es la más alta por
            ahora. No tienes que hacer nada — te avisaremos si alguien te supera.
          </p>
        </div>
      </div>
    )
  }

  // outbid
  return (
    <div className="flex items-start gap-3 rounded-xl border border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/40">
      <span className="bg-orange-500 text-white inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2 1 21h22zm0 14h2v2h-2zm0-7h2v5h-2z" />
        </svg>
      </span>
      <div className="flex-1">
        <p className="font-semibold text-orange-800 dark:text-orange-200">
          Te superaron por {formatCOP(difference)}
        </p>
        <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
          Pujaste <span className="line-through">{formatCOP(myAmount)}</span> y
          la subasta va ahora en <strong>{formatCOP(currentPrice)}</strong>.
          Para volver a quedar arriba, puja más de{' '}
          <strong>{formatCOP(currentPrice)}</strong>.
        </p>
      </div>
    </div>
  )
}
