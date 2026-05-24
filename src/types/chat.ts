/**
 * Modelos de chat y mensaje. Migrados desde lib/data/models/chat_model.dart y message_model.dart
 */
export interface Chat {
  id: number
  sellerId: number
  buyerId: number
}

export interface Message {
  id: number
  message: string
  dateTime: string // ISO 8601
  emitterId: number
  chatId: number
}

export interface SendMessagePayload {
  chatId: number
  message: string
}
