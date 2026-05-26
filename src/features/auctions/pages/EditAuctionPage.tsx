import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bidService, productService } from '@/services'
import type { Bid, Product } from '@/types'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { ImagePickerSlot } from '@/components/ui/ImagePickerSlot'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCOP, formatDateTime } from '@/utils/formatters'
import { ROUTES } from '@/routes/paths'

/**
 * Edicion / eliminacion de una subasta propia.
 * Migrada desde lib/presentation/screens/editar_miSubasta_screen.dart
 */
export function EditAuctionPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newPrice, setNewPrice] = useState('')
  const [newImages, setNewImages] = useState<(File | null)[]>([null, null, null])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const hasBids = bids.length > 0

  // Top 3 pujas mas recientes
  const recentBids = useMemo(
    () =>
      [...bids]
        .sort(
          (a, b) =>
            new Date(b.proposedAt).getTime() - new Date(a.proposedAt).getTime(),
        )
        .slice(0, 3),
    [bids],
  )

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
      setNewPrice(String(p.initialPrice))
    } catch (err) {
      console.error('[EditAuctionPage]', err)
      setError('No se pudo cargar la subasta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handleSave = async () => {
    if (!product) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      if (!hasBids && newPrice) {
        const v = Number(newPrice)
        if (!Number.isFinite(v) || v <= 0) {
          setError('El precio debe ser un numero mayor que 0')
          setSaving(false)
          return
        }
        await productService.updatePrice(product.id, v)
      }
      for (const f of newImages) {
        if (f) await productService.uploadImage(f, product.id)
      }
      setSuccess('Subasta actualizada correctamente')
      setNewImages([null, null, null])
      await load()
    } catch (err) {
      console.error('[EditAuctionPage.save]', err)
      setError('Error al actualizar la subasta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    const ok = window.confirm(
      'Seguro que deseas eliminar esta subasta? Esta accion no se puede deshacer.',
    )
    if (!ok) return

    setError(null)
    setDeleting(true)
    try {
      await productService.removeWithImages(product.id)
      navigate(ROUTES.myAuctions)
    } catch (err) {
      console.error('[EditAuctionPage.delete]', err)
      setError('Error al eliminar la subasta')
      setDeleting(false)
    }
  }

  if (loading) {
    return <p className="text-ink-soft py-10 text-center">Cargando subasta...</p>
  }
  if (error || !product) {
    return (
      <div className="mx-auto max-w-md">
        <Alert variant="error">{error ?? 'Subasta no encontrada'}</Alert>
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => navigate(ROUTES.myAuctions)}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const inputCls =
    'bg-surface-2 border-line text-ink focus:border-udea-verde-claro focus:ring-udea-verde-claro/30 rounded-xl border px-3 py-2 text-sm focus:ring focus:outline-none'

  const highestBid = hasBids ? product.currentPrice : null
  const increase = highestBid !== null ? highestBid - product.initialPrice : 0
  const increasePct =
    highestBid !== null && product.initialPrice > 0
      ? Math.round((increase / product.initialPrice) * 100)
      : 0

  return (
    <article className="bg-surface border-line mx-auto grid max-w-5xl gap-6 rounded-2xl border p-6 shadow-[var(--shadow-card)] lg:grid-cols-2">
      <ImageCarousel images={images} alt={product.name} />

      <div className="flex flex-col gap-4">
        <h1 className="text-ink text-3xl font-bold">{product.name}</h1>
        <p className="text-ink-muted">{product.description}</p>

        {/* Bloque de precios */}
        <div className="grid grid-cols-2 gap-3">
          {/* Precio inicial */}
          <div className="bg-surface-2 border-line flex flex-col gap-1 rounded-xl border p-4">
            <span className="text-ink-soft text-xs uppercase tracking-wide">
              Precio inicial
            </span>
            <span className="text-ink text-xl font-bold">
              {formatCOP(product.initialPrice)}
            </span>
          </div>

          {/* Puja actual mas alta */}
          {hasBids ? (
            <div className="border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 flex flex-col gap-1 rounded-xl border p-4">
              <span className="text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wide">
                Puja mas alta
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 text-xl font-bold">
                {formatCOP(highestBid!)}
              </span>
              {increase > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                  +{formatCOP(increase)} ({increasePct}%)
                </span>
              )}
            </div>
          ) : (
            <div className="border-line bg-surface-2 flex flex-col items-center justify-center rounded-xl border p-4 text-center">
              <span className="text-ink-soft text-xs">Aun sin pujas</span>
            </div>
          )}
        </div>

        {/* Fechas + cantidad de pujas */}
        <div className="text-ink-soft flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>Inicia: {formatDateTime(product.openingDate)}</span>
          <span>Cierra: {formatDateTime(product.closingDate)}</span>
          <span className="bg-udea-verde-suave text-udea-verde-oscuro dark:bg-surface-2 dark:text-udea-verde-claro inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
            {bids.length} {bids.length === 1 ? 'puja' : 'pujas'}
          </span>
        </div>

        {/* Mini historial de pujas */}
        {hasBids && (
          <section className="border-line rounded-xl border">
            <h2 className="border-line text-ink-muted border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide">
              Ultimas pujas
            </h2>
            <ul className="divide-line divide-y">
              {recentBids.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="text-ink-muted">
                    {formatDateTime(b.proposedAt)}
                  </span>
                  <span className="text-udea-verde-oscuro dark:text-udea-verde-claro font-semibold">
                    {formatCOP(b.proposedPrice)}
                  </span>
                </li>
              ))}
            </ul>
            {bids.length > 3 && (
              <p className="text-ink-soft border-line border-t px-3 py-2 text-center text-xs">
                Y {bids.length - 3} pujas mas
              </p>
            )}
          </section>
        )}

        {/* Edicion de precio (solo si no hay pujas) */}
        {hasBids ? (
          <Alert variant="warning">
            Esta subasta ya recibio pujas, no puedes cambiar el precio inicial.
          </Alert>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-muted font-medium">Nuevo precio inicial (COP)</span>
            <input
              type="number"
              min={1}
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className={inputCls}
            />
          </label>
        )}

        <fieldset>
          <legend className="text-ink-muted mb-2 text-sm font-medium">
            Agregar imagenes
          </legend>
          <div className="flex flex-wrap gap-3">
            {newImages.map((file, idx) => (
              <ImagePickerSlot
                key={idx}
                file={file}
                onChange={(f) =>
                  setNewImages((prev) =>
                    prev.map((x, i) => (i === idx ? f : x)),
                  )
                }
              />
            ))}
          </div>
        </fieldset>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button onClick={() => void handleSave()} loading={saving} fullWidth>
            Guardar cambios
          </Button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
          >
            {deleting ? 'Eliminando...' : 'Eliminar subasta'}
          </button>
        </div>
      </div>
    </article>
  )
}
