import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bidService, productService } from '@/services'
import type { Product } from '@/types'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { ImagePickerSlot } from '@/components/ui/ImagePickerSlot'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCOP } from '@/utils/formatters'
import { ROUTES } from '@/routes/paths'

/**
 * Edición / eliminación de una subasta propia.
 * Migrada desde lib/presentation/screens/editar_miSubasta_screen.dart
 */
export function EditAuctionPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [hasBids, setHasBids] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newPrice, setNewPrice] = useState('')
  const [newImages, setNewImages] = useState<(File | null)[]>([null, null, null])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

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
      setHasBids(bs.length > 0)
      setNewPrice(String(p.currentPrice ?? p.initialPrice))
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
          setError('El precio debe ser un número mayor que 0')
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
      '¿Seguro que deseas eliminar esta subasta? Esta acción no se puede deshacer.',
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
    return <p className="text-ink-soft py-10 text-center">Cargando subasta…</p>
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

  return (
    <article className="bg-surface border-line mx-auto grid max-w-5xl gap-6 rounded-2xl border p-6 shadow-[var(--shadow-card)] lg:grid-cols-2">
      <ImageCarousel images={images} alt={product.name} />

      <div className="flex flex-col gap-4">
        <h1 className="text-ink text-3xl font-bold">{product.name}</h1>
        <p className="text-ink-muted">{product.description}</p>

        <div className="bg-udea-verde-suave dark:bg-surface-2 border-udea-verde-claro/30 flex flex-col gap-1 rounded-xl border p-4">
          <span className="text-ink-muted text-sm">Precio actual</span>
          <span className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
            {formatCOP(product.currentPrice ?? product.initialPrice)}
          </span>
        </div>

        {hasBids ? (
          <Alert variant="warning">
            Esta subasta ya recibió pujas, no puedes cambiar el precio.
          </Alert>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-muted font-medium">Nuevo precio (COP)</span>
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
            Agregar imágenes
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
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            fullWidth
          >
            Guardar cambios
          </Button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
          >
            {deleting ? 'Eliminando…' : 'Eliminar subasta'}
          </button>
        </div>
      </div>
    </article>
  )
}
