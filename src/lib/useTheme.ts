import { useEffect, useState } from 'react'

/** Light/dark theme stored in localStorage and applied as a class on <html>. */
export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('finmate-theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  return { isDark, toggle }
}
