# A02 - Layouts e Componentes Base

## 📋 Objetivo
Criar os layouts principais (AuthLayout para login e AppLayout para sistema autenticado) e instalar componentes base do Shadcn/UI necessários.

## 📚 Referências
- **API Documentation**: `docs/API-DOCUMENTATION.md`
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 🎯 Tarefas

### 1. Instalar Componentes Shadcn/UI Base
```bash
# Componentes essenciais
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add navigation-menu
```

### 2. Criar AuthLayout (Para telas não autenticadas)
```typescript
// src/components/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            i9 Smart
          </h1>
          <p className="text-slate-400">
            Portal de Campanhas Publicitárias
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
```

### 3. Criar AppLayout (Para sistema autenticado)
```typescript
// src/components/layouts/AppLayout.tsx
import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "pl-64" : "pl-16"
      )}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

### 4. Criar Componente Sidebar
```typescript
// src/components/layouts/Sidebar.tsx
import { Home, Megaphone, Image, Monitor, Settings, BarChart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Megaphone, label: "Campanhas", path: "/campaigns" },
  { icon: Image, label: "Imagens", path: "/images" },
  { icon: Monitor, label: "Estações", path: "/stations" },
  { icon: BarChart, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Configurações", path: "/settings" },
]

interface SidebarProps {
  open: boolean
}

export function Sidebar({ open }: SidebarProps) {
  const location = useLocation()
  
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-50",
      open ? "w-64" : "w-16"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className={cn(
          "font-bold text-xl transition-opacity duration-300",
          !open && "opacity-0"
        )}>
          i9 Smart Campaigns
        </h1>
        {!open && (
          <span className="text-2xl font-bold">i9</span>
        )}
      </div>
      
      {/* Menu */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### 5. Criar Componente Header
```typescript
// src/components/layouts/Header.tsx
import { Menu, Sun, Moon, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/stores/auth.store'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          Portal de Campanhas
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notificações */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* Toggle Tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">
                {user?.name || 'Usuário'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

### 6. Criar ThemeProvider
```typescript
// src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'i9-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }
    
    root.classList.add(theme)
  }, [theme])
  
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }
  
  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  
  return context
}
```

### 7. Configurar Rotas com Layouts
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AppLayout } from '@/components/layouts/AppLayout'

// Páginas (serão criadas nos próximos agentes)
import { LoginPage } from '@/pages/auth/login'
import { DashboardPage } from '@/pages/dashboard'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          {/* Rotas não autenticadas */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          
          {/* Rotas autenticadas */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<CampaignFormPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Redirect raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
```

## ✅ Checklist de Validação
- [ ] AuthLayout criado para telas de login/registro
- [ ] AppLayout criado para sistema autenticado
- [ ] Sidebar responsiva e colapsável
- [ ] Header com toggle de tema e menu de usuário
- [ ] ThemeProvider implementado
- [ ] Sistema de tema dark/light funcionando
- [ ] Navegação visual funcionando
- [ ] Componentes Shadcn/UI instalados
- [ ] Layout responsivo
- [ ] Redirecionamento de não autenticados

## 📊 Resultado Esperado
- Login separado do sistema principal
- Após login, usuário entra no AppLayout
- Sistema de tema persistente
- Sidebar colapsável com navegação
- Visual profissional e consistente
- Componentes prontos para próximas fases

## 🚨 Pontos de Atenção
- Login é FORA do AppLayout (usa AuthLayout)
- AppLayout verifica autenticação e redireciona
- SEMPRE usar componentes ui/
- NUNCA hardcode cores
- SEMPRE usar variáveis de tema
- Manter consistência visual

## 📚 Documentação de Referência

**IMPORTANTE:** 
- Sempre consulte `docs/agents/shared/REACT-VITE-STANDARDS.md` para padrões de código
- Veja `docs/API-DOCUMENTATION.md` para entender os endpoints de autenticação