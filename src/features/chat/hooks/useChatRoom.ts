import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import type { IMessage } from '@stomp/stompjs'
import { env } from '@/config/env'
import { messageService, userService } from '@/services'
import type { AppUser, Message } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface UseChatRoomResult {
  messages: Message[]
  otherUser: AppUser | null
  loading: boolean
  error: string | null
  sending: boolean
  send: (text: string) => Promise<void>
}

/**
 * Maneja la conexión al chat: STOMP sobre WebSocket, suscripción a
 * `/topic/chat/:chatId` y envío a `/app/chat/:chatId/sendMessage`.
 *
 * Si STOMP falla, hace fallback al endpoint REST `POST /messages/text`.
 */
export function useChatRoom(chatId: number, otherUserId: number): UseChatRoomResult {
  const { myId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const clientRef = useRef<Client | null>(null)
  const connectedRef = useRef(false)

  // Carga inicial: usuario destino + historial de mensajes
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [u, msgs] = await Promise.all([
          userService.getById(otherUserId).catch(() => null),
          messageService.getByChat(chatId).catch(() => []),
        ])
        if (cancelled) return
        setOtherUser(u)
        setMessages(msgs)
      } catch (err) {
        console.error('[useChatRoom]', err)
        if (!cancelled) setError('No se pudo cargar el chat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [chatId, otherUserId])

  // Suscripción STOMP
  useEffect(() => {
    if (Number.isNaN(chatId)) return

    // Construye URL del WS de chat: por defecto wss://.../ws-chat
    const wsUrl = (() => {
      try {
        const u = new URL(env.apiUrl)
        const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
        return `${proto}//${u.host}${u.pathname.replace(/\/$/, '')}/ws-chat`
      } catch {
        return env.wsUrl
      }
    })()

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 4000,
      onConnect: () => {
        connectedRef.current = true
        client.subscribe(`/topic/chat/${chatId}`, (frame: IMessage) => {
          if (!frame.body) return
          try {
            const raw = JSON.parse(frame.body) as Partial<Message>
            if (raw.id == null) return
            const msg: Message = {
              id: raw.id,
              message: raw.message ?? '',
              chatId: raw.chatId ?? chatId,
              emitterId: raw.emitterId ?? 0,
              dateTime: raw.dateTime ?? new Date().toISOString(),
            }
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
            )
          } catch (err) {
            console.warn('[useChatRoom] mensaje no parseable', err)
          }
        })
      },
      onStompError: (frame) =>
        console.warn('[useChatRoom] STOMP error', frame.body),
      onWebSocketError: (e) =>
        console.warn('[useChatRoom] WS error', e),
      onDisconnect: () => {
        connectedRef.current = false
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      void client.deactivate()
      clientRef.current = null
      connectedRef.current = false
    }
  }, [chatId])

  const send = async (text: string) => {
    const clean = text.trim()
    if (!clean || myId == null) return
    setSending(true)
    try {
      const payload = JSON.stringify({
        message: clean,
        chatId,
        emitterId: myId,
      })

      if (clientRef.current && connectedRef.current) {
        clientRef.current.publish({
          destination: `/app/chat/${chatId}/sendMessage`,
          body: payload,
        })
      } else {
        // Fallback REST
        await messageService.send(chatId, myId, clean)
        const fresh = await messageService.getByChat(chatId)
        setMessages(fresh)
      }
    } catch (err) {
      console.error('[useChatRoom.send]', err)
      // Último fallback: REST
      try {
        await messageService.send(chatId, myId, clean)
        const fresh = await messageService.getByChat(chatId)
        setMessages(fresh)
      } catch (err2) {
        console.error('[useChatRoom.send fallback]', err2)
      }
    } finally {
      setSending(false)
    }
  }

  return { messages, otherUser, loading, error, sending, send }
}
