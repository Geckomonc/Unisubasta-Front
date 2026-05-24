import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useChatRoom } from '../hooks/useChatRoom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatDateTime } from '@/utils/formatters'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/routes/paths'

/**
 * Sala de chat individual con mensajes en tiempo real (STOMP).
 * Migrada desde lib/presentation/screens/chat/chat_screen.dart
 */
export function ChatRoomPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const chatId = Number(id)
  const otherUserId = Number(params.get('with') ?? 0)

  const { myId } = useAuth()
  const { messages, otherUser, loading, error, sending, send } = useChatRoom(
    chatId,
    otherUserId,
  )

  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      ),
    [messages],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const value = text
    setText('')
    await send(value)
  }

  if (Number.isNaN(chatId)) {
    return (
      <Alert variant="error">
        Ruta de chat inválida.{' '}
        <button onClick={() => navigate(ROUTES.chats)} className="underline">
          Volver a chats
        </button>
      </Alert>
    )
  }

  return (
    <section className="bg-surface border-line mx-auto flex h-[calc(100dvh-180px)] max-w-2xl flex-col rounded-2xl border shadow-[var(--shadow-card)]">
      <header className="border-line flex items-center gap-3 border-b p-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.chats)}
          className="hover:bg-surface-2 text-ink rounded-full p-1"
          aria-label="Volver"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div className="bg-udea-verde-claro h-9 w-9 overflow-hidden rounded-full">
          {otherUser?.urlFotoPerfil ? (
            <img
              src={otherUser.urlFotoPerfil}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-full w-full p-1.5 text-white"
              fill="currentColor"
            >
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-ink truncate text-sm font-semibold">
            {otherUser?.nombre ?? `Usuario #${otherUserId}`}
          </p>
          <p className="text-ink-soft text-xs">Chat #{chatId}</p>
        </div>
      </header>

      {error && (
        <div className="p-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div
        ref={scrollRef}
        className="bg-canvas flex-1 overflow-y-auto px-3 py-4"
      >
        {loading && (
          <p className="text-ink-soft text-center text-sm">Cargando…</p>
        )}
        {!loading && orderedMessages.length === 0 && (
          <p className="text-ink-soft text-center text-sm">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {orderedMessages.map((m) => {
            const mine = m.emitterId === myId
            return (
              <li
                key={m.id}
                className={mine ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={[
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                    mine
                      ? 'bg-udea-verde-oscuro rounded-br-sm text-white'
                      : 'bg-surface text-ink border-line rounded-bl-sm border',
                  ].join(' ')}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                  <p
                    className={[
                      'mt-1 text-[10px]',
                      mine ? 'text-white/70' : 'text-ink-soft',
                    ].join(' ')}
                  >
                    {formatDateTime(m.dateTime)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-line bg-surface flex items-center gap-2 border-t p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="bg-surface-2 border-line text-ink focus:border-udea-verde-claro focus:ring-udea-verde-claro/30 flex-1 rounded-full border px-4 py-2 text-sm focus:ring focus:outline-none"
        />
        <Button type="submit" loading={sending} disabled={!text.trim()}>
          Enviar
        </Button>
      </form>
    </section>
  )
}
