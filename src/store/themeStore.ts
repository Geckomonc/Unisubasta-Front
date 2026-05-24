import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeState {
  /** Preferencia del usuario (lo que se guarda en localStorage) */
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
}

/**
 * Store de tema persistido en localStorage bajo la clave `unisubasta-theme`.
 * El cálculo del tema efectivo (resolved) y la aplicación al DOM viven en
 * `ThemeProvider` para mantener el store libre de side-effects.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    { name: 'unisubasta-theme' },
  ),
)
