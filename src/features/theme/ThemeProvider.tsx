import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useThemeStore } from '@/store/themeStore'

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Aplica la clase `dark` a <html> según la preferencia del usuario.
 * Si la preferencia es 'system', escucha cambios del SO en tiempo real.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useThemeStore((s) => s.preference)

  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const effective =
        preference === 'system'
          ? mql.matches
            ? 'dark'
            : 'light'
          : preference
      root.classList.toggle('dark', effective === 'dark')
      root.style.colorScheme = effective
    }

    apply()

    if (preference === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [preference])

  return <>{children}</>
}
