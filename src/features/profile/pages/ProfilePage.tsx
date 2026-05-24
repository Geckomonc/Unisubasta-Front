import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { userService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { useProfileStats } from '../hooks/useProfileStats'
import { StarRating } from '@/components/ui/StarRating'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ROUTES } from '@/routes/paths'

/**
 * Pantalla de perfil. Migrada desde lib/presentation/screens/main/perfil_screen.dart
 */
export function ProfilePage() {
  const { appUser, firebaseUser, logout } = useAuth()
  const setAppUser = useAuthStore((s) => s.setAppUser)
  const stats = useProfileStats()

  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(
    appUser?.descripcionPersonal ?? '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const photo = appUser?.urlFotoPerfil || firebaseUser?.photoURL || ''
  const name = appUser?.nombre || firebaseUser?.displayName || 'Usuario UdeA'
  const email = firebaseUser?.email ?? ''

  const handleSaveDescription = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await userService.updateMe({
        descripcionPersonal: description.trim(),
      })
      setAppUser(updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('[ProfilePage]', err)
      setError('No se pudo guardar la descripción')
    } finally {
      setSaving(false)
    }
  }

  const card =
    'bg-surface border-line rounded-2xl border p-4 shadow-[var(--shadow-card)]'

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 px-2">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="bg-udea-verde-suave dark:bg-surface-2 ring-line h-24 w-24 overflow-hidden rounded-full ring-2">
          {photo ? (
            <img
              src={photo}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-udea-verde-oscuro dark:text-udea-verde-claro flex h-full w-full items-center justify-center text-4xl font-bold">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-ink text-2xl font-bold">{name}</h1>
          <p className="text-ink-soft text-sm">{email}</p>
        </div>
      </header>

      {/* Tema */}
      <div className={card}>
        <h2 className="text-ink-muted mb-3 text-sm font-medium">
          Apariencia
        </h2>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-soft text-xs">
            Elige el aspecto que prefieras. <strong>Sistema</strong> sigue la
            configuración de tu dispositivo.
          </p>
          <ThemeToggle variant="segment" />
        </div>
      </div>

      {/* Estadísticas */}
      <div className={`${card} grid grid-cols-3 gap-2`}>
        <Stat number={stats.subastasCreadas} label1="Subastas" label2="creadas" />
        <Stat number={stats.pujasRealizadas} label1="Pujas" label2="realizadas" />
        <Stat number={stats.subastasGanadas} label1="Subastas" label2="ganadas" />
      </div>

      {/* Calificación */}
      <div className={card}>
        <p className="text-ink-muted mb-1 text-sm font-medium">Calificación</p>
        <StarRating value={appUser?.reputacionPromedio ?? 0} />
      </div>

      {/* Descripción */}
      <div className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-ink-muted text-sm font-medium">Acerca de mí</h2>
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setDescription(appUser?.descripcionPersonal ?? '')
                setEditing(true)
              }}
              className="text-udea-verde-oscuro dark:text-udea-verde-claro text-sm font-medium hover:underline"
            >
              Editar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-ink-soft text-sm hover:underline"
              disabled={saving}
            >
              Cancelar
            </button>
          )}
        </div>

        {editing ? (
          <>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-surface-2 border-line text-ink focus:border-udea-verde-claro focus:ring-udea-verde-claro/30 w-full rounded-xl border px-3 py-2 text-sm focus:ring focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={() => void handleSaveDescription()} loading={saving}>
                Guardar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-ink text-sm whitespace-pre-line">
            {appUser?.descripcionPersonal || 'Sin descripción aún.'}
          </p>
        )}

        {error && (
          <div className="mt-3">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
        {saved && (
          <div className="mt-3">
            <Alert variant="success">Descripción actualizada</Alert>
          </div>
        )}
      </div>

      {/* Mensajes */}
      <Link
        to={ROUTES.chats}
        className={`${card} text-ink hover:bg-surface-2 flex items-center justify-between text-sm font-medium transition-colors`}
      >
        <span>Mensajes</span>
        <svg
          viewBox="0 0 24 24"
          className="text-ink-soft h-5 w-5"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9 6l6 6-6 6V6z" />
        </svg>
      </Link>

      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-red-500 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  )
}

function Stat({
  number,
  label1,
  label2,
}: {
  number: number
  label1: string
  label2: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-udea-verde-oscuro dark:text-udea-verde-claro text-2xl font-bold">
        {number}
      </span>
      <span className="text-ink-muted text-xs">{label1}</span>
      <span className="text-ink-muted text-xs">{label2}</span>
    </div>
  )
}
