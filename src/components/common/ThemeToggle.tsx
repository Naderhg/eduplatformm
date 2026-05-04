import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('ThemeToggle mounted')
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    console.log('Initial theme:', initialTheme)
    setTheme(initialTheme)
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('Added dark class to document')
    }
  }, [])

  const toggleTheme = () => {
    console.log('Toggle theme clicked! Current theme:', theme)
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    console.log('New theme will be:', newTheme)
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    console.log('Saved to localStorage')
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('Added dark class')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Removed dark class')
    }
    
    console.log('Document classes:', document.documentElement.className)
    console.log('HTML element:', document.documentElement)
    console.log('Computed background style:', getComputedStyle(document.documentElement).getPropertyValue('--background'))
    console.log('Body background:', getComputedStyle(document.body).backgroundColor)
  }

  if (!mounted) {
    console.log('Not mounted yet')
    return null
  }

  console.log('Rendering ThemeToggle, current theme:', theme)

  return (
    <>
      <style>
        {`
          .dark-test {
            background-color: #1f2937 !important;
            color: white !important;
          }
        `}
      </style>
      <button
        onClick={() => {
          console.log('Button clicked!')
          toggleTheme()
        }}
        className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors p-2"
        style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
          color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          border: '2px solid red',
          fontSize: '12px'
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  )
}
