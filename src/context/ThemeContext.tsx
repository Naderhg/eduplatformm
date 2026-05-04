import { createContext, useContext } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

const ThemeContext = createContext<{
  theme: string | undefined
  setTheme: (theme: string) => void
}>({
  theme: undefined,
  setTheme: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useNextTheme()

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
