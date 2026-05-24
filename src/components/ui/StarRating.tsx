interface StarRatingProps {
  /** Valor de 0 a 5 (puede ser decimal) */
  value: number
  size?: number
  label?: boolean
}

/**
 * Indicador de calificación con estrellas (no editable).
 * Equivalente a RatingBarIndicator de Flutter.
 */
export function StarRating({ value, size = 22, label = true }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value))
  const fullStars = Math.floor(clamped)
  const partial = clamped - fullStars
  const empty = 5 - fullStars - (partial > 0 ? 1 : 0)

  const Star = ({ fill }: { fill: number }) => (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 text-slate-300 dark:text-slate-700"
        fill="currentColor"
        width={size}
        height={size}
      >
        <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
      >
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 text-amber-400"
          fill="currentColor"
          width={size}
          height={size}
        >
          <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </span>
    </span>
  )

  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`Calificación ${clamped} de 5`}
    >
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} fill={1} />
      ))}
      {partial > 0 && <Star key="p" fill={partial} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} fill={0} />
      ))}
      {label && (
        <span className="text-ink-muted ml-1 text-sm">{clamped.toFixed(1)}</span>
      )}
    </span>
  )
}
