'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resolvedTheme: Theme
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const DEFAULT_STORAGE_KEY = 'vf-theme'

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

function readStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  return defaultTheme
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}) {
  const fallback = (defaultTheme === 'dark' ? 'dark' : 'light') as Theme

  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return fallback
    if (document.documentElement.classList.contains('dark')) return 'dark'
    if (document.documentElement.classList.contains('light')) return 'light'
    return readStoredTheme(storageKey, fallback)
  })

  React.useEffect(() => {
    applyThemeClass(theme)
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      /* ignore */
    }
  }, [theme, storageKey])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setThemeState(current => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      resolvedTheme: theme,
    }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
