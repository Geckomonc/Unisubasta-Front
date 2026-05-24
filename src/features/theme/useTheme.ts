import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import type { ThemePreference } from '@/store/themeStore'

/**
 * Devuelve la preferencia, el tema "resolved" (light/dark efectivo) y un setter.
 */
export function useTheme() {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)

  // Calcula el tema efectivo, incluso si la preferencia es 'system'
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
    if (preference !== 'system') return preference
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const compute = () => {
      if (preference === 'system') {
        setResolved(mql.matches ? 'dark' : 'light')
      } else {
        setResolved(preference)
      }
    }
    compute()
    if (preference === 'system') {
      mql.addEventListener('change', compute)
      return () => mql.removeEventListener('change', compute)
    }
  }, [preference])

  return {
    preference,
    setPreference,
    resolved,
    isDark: resolved === 'dark',
  } satisfies {
    preference: ThemePreference
    setPreference: (p: ThemePreference) => void
    resolved: 'light' | 'dark'
    isDark: boolean
  }
}
