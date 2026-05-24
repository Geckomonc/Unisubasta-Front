import { useEffect, useState } from 'react'
import { bidService, productService } from '@/services'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface ProfileStats {
  loading: boolean
  subastasCreadas: number
  pujasRealizadas: number
  subastasGanadas: number
}

/**
 * Contadores del perfil: subastas creadas, pujas realizadas, subastas ganadas.
 */
export function useProfileStats(): ProfileStats {
  const { myId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subastasCreadas, setSubastasCreadas] = useState(0)
  const [pujasRealizadas, setPujasRealizadas] = useState(0)
  const [subastasGanadas, setSubastasGanadas] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (myId == null) return
      setLoading(true)
      try {
        const [productos, bids] = await Promise.all([
          productService.getBySeller(myId).catch(() => []),
          bidService.getMine().catch(() => []),
        ])
        if (cancelled) return
        setSubastasCreadas(productos.length)
        setPujasRealizadas(bids.length)
        // Subastas ganadas: productos donde buyerId === myId
        // (no hay endpoint específico; se podría derivar más tarde)
        setSubastasGanadas(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [myId])

  return { loading, subastasCreadas, pujasRealizadas, subastasGanadas }
}
