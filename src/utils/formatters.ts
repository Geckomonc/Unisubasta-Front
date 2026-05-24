/**
 * Formatea un número como moneda colombiana (COP).
 * Equivalente al uso de `intl` en Flutter.
 */
const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(value: number): string {
  if (Number.isNaN(value)) return '$0'
  return copFormatter.format(value)
}

/**
 * Formatea una fecha ISO a "dd/MM/yyyy HH:mm".
 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Devuelve los milisegundos restantes hasta una fecha. Negativo si ya pasó.
 */
export function msUntil(iso: string): number {
  return new Date(iso).getTime() - Date.now()
}
