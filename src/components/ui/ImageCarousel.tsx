import { useCallback, useEffect, useRef, useState } from 'react'

const FALLBACK_IMG = 'https://cdn-icons-png.flaticon.com/512/679/679720.png'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

/**
 * Carrusel con flechas, miniaturas, puntitos, navegación por teclado
 * (← →), swipe táctil y vista fullscreen.
 *
 * Equivalente al PageView + InteractiveViewer de Flutter.
 */
export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const list = images.length === 0 ? [FALLBACK_IMG] : images
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const hasMany = list.length > 1
  const current = list[index] ?? list[0]

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + list.length) % list.length),
    [list.length],
  )
  const next = useCallback(
    () => setIndex((i) => (i + 1) % list.length),
    [list.length],
  )

  // Navegación por teclado cuando está abierto en fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fullscreen, prev, next])

  // Swipe táctil
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 40) {
      diff > 0 ? prev() : next()
    }
    touchStartX.current = null
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div
          className="bg-surface-2 border-line relative aspect-square w-full overflow-hidden rounded-2xl border"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="block h-full w-full"
            aria-label="Ver imagen ampliada"
          >
            <img
              src={current}
              alt={alt}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = FALLBACK_IMG
              }}
            />
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Imagen anterior"
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow-md transition-opacity hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Imagen siguiente"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow-md transition-opacity hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </button>

              <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1.5">
                {list.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      'block h-2 rounded-full transition-all',
                      i === index ? 'w-4 bg-white' : 'w-2 bg-white/60',
                    ].join(' ')}
                  />
                ))}
              </div>

              <span className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                {index + 1} / {list.length}
              </span>
            </>
          )}
        </div>

        {hasMany && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {list.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setIndex(i)}
                className={[
                  'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  i === index
                    ? 'border-udea-verde-oscuro dark:border-udea-verde-claro'
                    : 'border-transparent opacity-70 hover:opacity-100',
                ].join(' ')}
                aria-label={`Ir a la imagen ${i + 1}`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Imagen anterior"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Imagen siguiente"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                {index + 1} / {list.length}
              </span>
            </>
          )}

          <img
            src={current}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
