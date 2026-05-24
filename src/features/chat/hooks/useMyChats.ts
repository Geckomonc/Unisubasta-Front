import { useEffect, useState } from 'react'
import { chatService, userService } from '@/services'
import type { AppUser, Chat } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface EnrichedChat {
  chat: Chat
  otherUser: AppUser | null
  otherUserId: number
}

/**
 * Carga la lista de chats del usuario y enriquece cada uno con la info
 * del "otro" participante (vendedor o comprador, el que no soy yo).
 */
export function useMyChats() {
  const { myId } = useAuth()
  const [chats, setChats] = useState<EnrichedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (myId == null) return
    setLoading(true)
    setError(null)
    try {
      const rawChats = await chatService.getByUser(myId)

      // Cache de usuarios para no pedir el mismo varias veces
      const userCache = new Map<number, AppUser | null>()
      const getUser = async (id: number) => {
        if (userCache.has(id)) return userCache.get(id) ?? null
        try {
          const u = await userService.getById(id)
          userCache.set(id, u)
          return u
        } catch {
          userCache.set(id, null)
          return null
        }
      }

      const enriched = await Promise.all(
        rawChats.map(async (chat) => {
          const otherId = chat.sellerId === myId ? chat.buyerId : chat.sellerId
          const otherUser = await getUser(otherId)
          return { chat, otherUser, otherUserId: otherId }
        }),
      )
      setChats(enriched)
    } catch (err) {
      console.error('[useMyChats]', err)
      setError('No se pudieron cargar tus chats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  return { chats, loading, error, reload: load }
}
