import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { formatCOP } from '@/utils/formatters'

const FALLBACK_IMG = 'https://cdn-icons-png.flaticon.com/512/679/679720.png'

export type BidCardState = 'winning' | 'outbid'

interface ProductCardProps {
  to: string
  name: string
  description: string
  currentPrice: number
  images: string[]
  ribbon?: string
  /** Si se pasa, sobreescribe el ribbon y agrega contexto de puja */
  bid?: {
    state: BidCardState
    /** Mi última puja en este producto */
    myAmount: number
    /** Diferencia con el precio actual (solo aplica a 'outbid') */
    difference?: number
  }
}

/**
 * Tarjeta de producto reutilizable. Migrada desde
 * lib/presentation/widgets/shared/tarjeta_producto.dart
 *
 * Si `bid` está presente, la tarjeta destaca el estado:
 *  - winning → borde y badge verde, mensaje "Vas ganando".
 *  - outbid  → borde y badge naranja, mensaje "Te superaron por $X".
 */
export function ProductCard({
  to,
  name,
  description,
  currentPrice,
  images,
  ribbon,
  bid,
}: ProductCardProps) {
  const list = images.length > 0 ? images : [FALLBACK_IMG]
  const [index, setIndex] = useState(0)
  const hasMany = list.length > 1
  const img = list[index] ?? FALLBACK_IMG

  const stopAndDo = (fn: () => void) => (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    fn()
  }
  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length)
  const next = () => setIndex((i) => (i + 1) % list.length)

  // Estilo del borde / ribbon según el estado de puja
  const borderClass = bid
    ? bid.state === 'winning'
      ? 'border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/30'
      : 'border-orange-500 dark:border-orange-400 ring-1 ring-orange-500/30'
    : 'border-line'

  const ribbonText = bid
    ? bid.state === 'winning'
      ? 'Vas ganando'
      : 'Te superaron'
    : ribbon

  const ribbonClass = bid
    ? bid.state === 'winning'
      ? 'bg-emerald-500'
      : 'bg-orange-500'
    : 'bg-udea-verde-oscuro'

  return (
    <Link
      to={to}
      className={[
        'bg-surface group focus-visible:ring-udea-verde-claro flex flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2',
        borderClass,
      ].join(' ')}
    >
      <div className="bg-surface-2 relative aspect-square w-full overflow-hidden">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = FALLBACK_IMG
          }}
        />

        {ribbonText && (
          <span
            className={[
              'absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-medium text-white shadow-sm',
              ribbonClass,
            ].join(' ')}
          >
            {ribbonText}
          </span>
        )}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={stopAndDo(prev)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-1.5 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={stopAndDo(next)}
              aria-label="Imagen siguiente"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>
            <div className="absolute right-0 bottom-1.5 left-0 flex justify-center gap-1">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={[
                    'block h-1.5 rounded-full transition-all',
                    i === index ? 'w-3 bg-white' : 'w-1.5 bg-white/60',
                  ].join(' ')}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-ink truncate text-sm font-bold">{name}</h3>
        <p className="text-ink-soft line-clamp-1 text-xs">{description}</p>

        {bid ? (
          <BidStatusBlock
            state={bid.state}
            myAmount={bid.myAmount}
            currentPrice={currentPrice}
            difference={bid.difference ?? 0}
          />
        ) : (
          <p className="text-udea-verde-oscuro dark:text-udea-verde-claro mt-1 text-sm font-semibold">
            Puja actual<br />
            <span className="text-base">{formatCOP(currentPrice)}</span>
          </p>
        )}
      </div>
    </Link>
  )
}

interface BidStatusBlockProps {
  state: BidCardState
  myAmount: number
  currentPrice: number
  difference: number
}

function BidStatusBlock({
  state,
  myAmount,
  currentPrice,
  difference,
}: BidStatusBlockProps) {
  if (state === 'winning') {
    return (
      <div className="mt-1 flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckIcon /> Tu puja va arriba
        </span>
        <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
          {formatCOP(myAmount)}
        </span>
      </div>
    )
  }
  // outbid
  return (
    <div className="mt-1 flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-300">
        <AlertIcon /> Te superaron por {formatCOP(difference)}
      </span>
      <span className="text-ink-soft text-xs line-through">
        Tu puja: {formatCOP(myAmount)}
      </span>
      <span className="text-base font-bold text-orange-700 dark:text-orange-300">
        Actual: {formatCOP(currentPrice)}
      </span>
    </div>
  )
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
    <path d="M12 2 1 21h22zm0 14h2v2h-2zm0-7h2v5h-2z" />
  </svg>
)
