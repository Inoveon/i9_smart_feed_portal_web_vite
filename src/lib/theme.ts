type ThemeMode = 'light' | 'dark'
type ThemePalette = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber'

const PALETTES: Record<ThemePalette, { primary: string; ring: string; accent?: string }> = {
  blue: { primary: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%' },
  emerald: { primary: '152.4 76.2% 39.8%', ring: '152.4 76.2% 39.8%' },
  violet: { primary: '258.3 89.5% 66.3%', ring: '258.3 89.5% 66.3%' },
  rose: { primary: '349.7 89.2% 60.2%', ring: '349.7 89.2% 60.2%' },
  amber: { primary: '37.7 92.1% 50.2%', ring: '37.7 92.1% 50.2%' },
}

export function getSavedTheme(): ThemeMode | null {
  const saved = localStorage.getItem('theme') as ThemeMode | null
  return saved === 'light' || saved === 'dark' ? saved : null
}

export function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(mode: ThemeMode) {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', mode)
}

export function getSavedPalette(): ThemePalette | null {
  const saved = localStorage.getItem('theme_palette') as ThemePalette | null
  return saved && PALETTES[saved] ? saved : null
}

export function applyPalette(palette: ThemePalette) {
  const p = PALETTES[palette]
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--primary', p.primary)
  rootStyle.setProperty('--ring', p.ring)
  if (p.accent) rootStyle.setProperty('--accent', p.accent)
  localStorage.setItem('theme_palette', palette)
}

export function initThemeAndPalette() {
  // Theme
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme ?? getSystemTheme())
  // Palette
  const savedPalette = getSavedPalette()
  if (savedPalette) applyPalette(savedPalette)
}

export type { ThemeMode, ThemePalette }

