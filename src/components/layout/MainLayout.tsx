import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'

/**
 * Layout principal de la app autenticada. Replica el Scaffold + BottomNav
 * de main_screen.dart en Flutter.
 */
export function MainLayout() {
  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
