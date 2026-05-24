import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService, timerService } from '@/services'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ImagePickerSlot } from '@/components/ui/ImagePickerSlot'
import { CATEGORIES } from '@/types'
import type { CategoryKey } from '@/types'
import { ROUTES } from '@/routes/paths'

const DURACIONES = [
  { hours: 24, ms: 1_440_000, label: '24 h' },
  { hours: 48, ms: 2_880_000, label: '48 h' },
  { hours: 72, ms: 4_320_000, label: '72 h' },
] as const

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  libros: 'Libros',
  ropa: 'Ropa',
  muebles: 'Muebles',
  computadores: 'Computadores',
  celulares: 'Celulares',
  vehiculos: 'Vehículos',
  otros: 'Otros',
}

/**
 * Pantalla de registro de un nuevo producto / subasta.
 * Migrada desde lib/presentation/screens/registro_producto_screen.dart
 */
export function NewProductPage() {
  const navigate = useNavigate()
  const { myId } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<CategoryKey>('otros')
  const [durationIdx, setDurationIdx] = useState(0)
  const [images, setImages] = useState<(File | null)[]>([null, null, null])
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const setImageAt = (idx: number) => (f: File | null) => {
    setImages((prev) => prev.map((x, i) => (i === idx ? f : x)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim() || !description.trim() || !price.trim()) {
      setError('Completa todos los campos obligatorios')
      return
    }
    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError('El precio mínimo debe ser un número mayor que 0')
      return
    }
    if (images.every((i) => i === null)) {
      setError('Debes subir al menos una imagen')
      return
    }
    if (myId == null) {
      setError('No se pudo determinar tu usuario, recarga la página')
      return
    }

    setPublishing(true)
    try {
      const duration = DURACIONES[durationIdx]
      const timerId = await timerService.create(duration.ms)

      const now = new Date()
      const closing = new Date(now.getTime() + duration.hours * 3_600_000)

      const product = await productService.create({
        name: name.trim(),
        description: description.trim(),
        initialPrice: priceNum,
        openingDate: now.toISOString(),
        closingDate: closing.toISOString(),
        timerId,
        categoryId: CATEGORIES[category],
        sellerId: myId,
      })

      for (const img of images) {
        if (img) await productService.uploadImage(img, product.id)
      }

      setSuccess('Producto publicado correctamente')
      setTimeout(() => navigate(ROUTES.myAuctions), 800)
    } catch (err) {
      console.error('[NewProductPage]', err)
      setError('Error al publicar el producto')
    } finally {
      setPublishing(false)
    }
  }

  const inputCls =
    'bg-surface border-line text-ink focus:border-udea-verde-claro focus:ring-udea-verde-claro/30 rounded-xl border px-3 py-2 text-sm focus:ring focus:outline-none'

  return (
    <section className="bg-surface border-line mx-auto flex max-w-2xl flex-col gap-6 rounded-2xl border p-6 shadow-[var(--shadow-card)]">
      <header className="flex items-center justify-between">
        <h1 className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
          Publicar producto
        </h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-surface-2 hover:bg-line text-ink rounded-full px-4 py-1.5 text-sm transition-colors"
        >
          Cancelar
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset>
          <legend className="text-ink-muted mb-2 text-sm font-medium">
            Subir fotos
          </legend>
          <div className="flex flex-wrap gap-3">
            {images.map((file, idx) => (
              <ImagePickerSlot
                key={idx}
                file={file}
                onChange={setImageAt(idx)}
              />
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-muted font-medium">Nombre del producto</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Computador Asus"
            className={inputCls}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-muted font-medium">Descripción</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Asus VivoBook 14, casi nuevo…"
            rows={4}
            className={inputCls}
            required
          />
        </label>

        <fieldset>
          <legend className="text-ink-muted mb-2 text-sm font-medium">
            Categoría
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
              const selected = category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    selected
                      ? 'bg-udea-verde-oscuro text-white'
                      : 'bg-surface-2 text-ink-muted border-line hover:border-udea-verde-claro border',
                  ].join(' ')}
                >
                  {CATEGORY_LABELS[key]}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-ink-muted mb-2 text-sm font-medium">
            Duración de la subasta
          </legend>
          <div className="flex gap-4">
            {DURACIONES.map((d, idx) => (
              <label
                key={d.hours}
                className="text-ink flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="duracion"
                  checked={durationIdx === idx}
                  onChange={() => setDurationIdx(idx)}
                  className="accent-udea-verde-oscuro"
                />
                {d.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-muted font-medium">Precio mínimo (COP)</span>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50000"
            className={inputCls}
            required
          />
        </label>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" loading={publishing} fullWidth>
          Publicar subasta
        </Button>
      </form>
    </section>
  )
}
