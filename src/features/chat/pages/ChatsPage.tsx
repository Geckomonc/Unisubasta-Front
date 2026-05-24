import { Link } from 'react-router-dom'
import { useMyChats } from '../hooks/useMyChats'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ROUTES } from '@/routes/paths'

/**
 * Lista de chats del usuario.
 * Migrada desde lib/presentation/screens/chat/chats_screen.dart
 */
export function ChatsPage() {
  const { chats, loading, error, reload } = useMyChats()

  return (
    <PullToRefresh onRefresh={reload}>
    <section className="mx-auto flex max-w-2xl flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
          Mis chats
        </h1>
        <RefreshButton
          onClick={() => void reload()}
          loading={loading}
          className="hidden sm:inline-flex"
        />
      </header>

      {loading && (
        <p className="text-ink-soft py-10 text-center">Cargando chats…</p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && chats.length === 0 && (
        <p className="text-ink-soft py-10 text-center">
          No tienes chats todavía.
        </p>
      )}

      <ul className="bg-surface border-line divide-line divide-y rounded-2xl border shadow-[var(--shadow-card)]">
        {chats.map(({ chat, otherUser, otherUserId }) => {
          const nombre = otherUser?.nombre ?? `Usuario #${otherUserId}`
          const foto = otherUser?.urlFotoPerfil ?? ''

          return (
            <li key={chat.id}>
              <Link
                to={{
                  pathname: ROUTES.chat(chat.id),
                  search: `?with=${otherUserId}`,
                }}
                className="hover:bg-surface-2 flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <div className="bg-udea-verde-claro flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-white">
                  {foto ? (
                    <img
                      src={foto}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate text-sm font-medium">
                    {nombre}
                  </p>
                  <p className="text-ink-soft truncate text-xs">
                    Toca para abrir el chat
                  </p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="text-ink-soft h-4 w-4"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9 6l6 6-6 6V6z" />
                </svg>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
    </PullToRefresh>
  )
}
