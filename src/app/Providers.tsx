import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ThemeProvider } from '@/features/theme/ThemeProvider'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Punto único para envolver la app con todos los providers globales.
 * Si en el futuro se agregan más (Query, i18n…), van aquí.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
