import { api } from './api'
import type { Chat, Message } from '@/types'

/**
 * Servicios de chats y mensajes.
 * Migrados desde lib/data/services/chat_service.dart y message_service.dart
 */
export const chatService = {
  /** Chats donde participa un usuario (vendedor o comprador) */
  async getByUser(userId: number): Promise<Chat[]> {
    const { data } = await api.get<Chat[]>(`/chats/user/${userId}`)
    return data
  },
}

export const messageService = {
  async getByChat(chatId: number): Promise<Message[]> {
    const { data } = await api.get<Message[]>(`/messages/${chatId}`)
    return data
  },

  async send(chatId: number, emitterId: number, text: string): Promise<void> {
    await api.post('/messages/text', {
      id: 0,
      message: text,
      chatId,
      emitterId,
      dateTime: new Date().toISOString(),
    })
  },
}
