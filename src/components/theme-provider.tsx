"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "warehouse-theme"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const DEFAULT_VALUE: ThemeContextValue = {
  theme: "system",
  setTheme: () => {},
}

const ThemeContext = React.createContext(DEFAULT_VALUE)

function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === "light" || value === "dark" || value === "system") {
      return value
    }
  } catch {
    // localStorage tidak tersedia — pakai system
  }
  return "system"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme)

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    function syncClass() {
      const effective =
        theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : theme
      document.documentElement.classList.toggle("dark", effective === "dark")
    }

    syncClass()

    const onSystemChange = () => syncClass()
    media.addEventListener("change", onSystemChange)

    function onStorage(event: StorageEvent) {
      if (
        event.key === STORAGE_KEY &&
        (event.newValue === "light" ||
          event.newValue === "dark" ||
          event.newValue === "system")
      ) {
        setThemeState(event.newValue)
      }
    }
    window.addEventListener("storage", onStorage)

    return () => {
      media.removeEventListener("change", onSystemChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // abaikan bila storage gagal
    }
    setThemeState(next)
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  )

  return (
    <ThemeContext value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (typeof event.key !== "string" || event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const effective = getEffectiveTheme(theme)
      setTheme(effective === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [theme, setTheme])

  return null
}