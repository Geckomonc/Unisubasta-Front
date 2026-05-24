import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  /** Si false, el gesto se ignora (útil en escritorio) */
  enabled?: boolean
}

const THRESHOLD = 70 // px que hay que arrastrar para disparar refresh
const MAX_PULL = 120 // máximo de arrastre visual
const DAMPING = 0.5 // factor de "resistencia" (sentir el arrastre menos lineal)

/**
 * Wrapper que añade gesto "pull to refresh" en pantallas táctiles.
 * Solo se activa cuando el scroll del documento está en 0 y el usuario
 * arrastra hacia abajo. Muestra un indicador circular que rota con el
 * arrastre y luego hace `spin` durante el refresh.
 *
 * El refresh visual NO empuja el contenido (no hace falta), aparece
 * flotando bajo el header. Esto evita problemas de layout.
 */
export function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
}: PullToRefreshProps) {
  const [distance, setDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Refs para evitar re-suscribir los listeners en cada render
  const distanceRef = useRef(0)
  const refreshingRef = useRef(false)
  const startYRef = useRef<number | null>(null)
  const pullingRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    if (!enabled) return

    const updateDistance = (d: number) => {
      distanceRef.current = d
      setDistance(d)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current) return
      // Solo arrancar si el documento está en el tope
      if (window.scrollY > 0) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || startYRef.current === null) return
      if (refreshingRef.current) return

      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        // Está arrastrando hacia arriba → cancelar
        pullingRef.current = false
        updateDistance(0)
        return
      }

      // Resistencia + límite máximo
      const damped = Math.min(delta * DAMPING, MAX_PULL)
      updateDistance(damped)

      // Bloquear el scroll del navegador mientras arrastra hacia abajo
      if (damped > 0 && e.cancelable) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!pullingRef.current) return
      pullingRef.current = false
      startYRef.current = null

      const triggered = distanceRef.current >= THRESHOLD
      if (triggered && !refreshingRef.current) {
        refreshingRef.current = true
        setRefreshing(true)
        updateDistance(THRESHOLD) // se queda anclado mientras carga
        try {
          await onRefreshRef.current()
        } catch (err) {
          console.error('[PullToRefresh] onRefresh falló', err)
        } finally {
          refreshingRef.current = false
          setRefreshing(false)
          updateDistance(0)
        }
      } else {
        updateDistance(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [enabled])

  const ready = distance >= THRESHOLD || refreshing
  const opacity = Math.min(distance / THRESHOLD, 1)
  // Pequeño rebote suave cuando se suelta
  const transitionStyle = !refreshing && distance === 0
    ? 'transform 200ms ease, opacity 200ms ease'
    : 'opacity 100ms ease'

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center"
        style={{
          opacity,
          transform: `translateY(${Math.min(distance, MAX_PULL)}px)`,
          transition: transitionStyle,
        }}
        aria-hidden={!refreshing}
      >
        <span
          className={[
            'bg-surface ring-line flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-1',
            ready ? 'text-udea-verde-claro' : 'text-ink-soft',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={['h-5 w-5', refreshing ? 'animate-spin' : ''].join(' ')}
            style={!refreshing ? { transform: `rotate(${distance * 3}deg)` } : undefined}
            aria-hidden
          >
            <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10H17.6A6 6 0 1 1 12 6c1.65 0 3.13.67 4.22 1.78L13 11h7V4z" />
          </svg>
        </span>
      </div>
      {children}
    </>
  )
}
