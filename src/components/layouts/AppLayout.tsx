import { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Monitor,
  FileText,
  BarChart3,
  Shield,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react'

// Componentes UI (Shadcn)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

// Hooks
import { useAuth } from '@/hooks/useAuth'
import { applyTheme, getSavedTheme, getSystemTheme, applyPalette, getSavedPalette, type ThemeMode, type ThemePalette } from '@/lib/theme'
import { Link } from 'react-router-dom'

// Props do layout
interface AppLayoutProps {
  children: ReactNode
}

/**
 * LAYOUT PRINCIPAL PARA USUÁRIOS AUTENTICADOS
 * 
 * Features:
 * - Header com navegação, search, notificações e user menu
 * - Sidebar responsiva (desktop/mobile)
 * - Toggle tema dark/light
 * - Menu baseado em permissões
 * - Área de conteúdo principal
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme() ?? getSystemTheme())
  const [palette, setPalette] = useState<ThemePalette>(getSavedPalette() ?? 'blue')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { 
    user, 
    logout, 
    getUserInitials,
    isLogoutLoading
  } = useAuth()

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const toggleTheme = () => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const changePalette = (p: ThemePalette) => {
    setPalette(p)
    applyPalette(p)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // erro tratado pelo hook
    }
  }

  // =============================================================================
  // NAVEGAÇÃO
  // =============================================================================

  // const location = useLocation()
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Monitor,
      current: false,
      roles: ['admin', 'editor', 'viewer'] as const
    },
    {
      name: 'Filiais',
      href: '/branches',
      icon: Settings,
      current: false,
      roles: ['admin', 'editor', 'viewer'] as const
    },
    {
      name: 'Estações',
      href: '/stations',
      icon: Monitor,
      current: false,
      roles: ['admin', 'editor', 'viewer'] as const
    },
    {
      name: 'Campanhas',
      href: '/campaigns',
      icon: FileText,
      current: false,
      roles: ['admin', 'editor', 'viewer'] as const
    },
    /* TODO: Implementar módulo de relatórios
    {
      name: 'Relatórios',
      href: '/analytics',
      icon: BarChart3,
      current: false,
      roles: ['admin', 'editor'] as const
    },
    */
    {
      name: 'Usuários',
      href: '/users',
      icon: Shield,
      current: false,
      roles: ['admin'] as const
    },
  ]

  // Filtrar navegação baseada em permissões
  const visibleNavigation = navigation.filter(item => {
    if (!user?.role) return false
    return item.roles.includes(user.role as any)
  })

  // const activePath = location.pathname

  // =============================================================================
  // COMPONENTE DE NAVEGAÇÃO
  // =============================================================================

  const NavigationItems = () => (
    <nav className="flex flex-col space-y-1">
      {visibleNavigation.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.name}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            `}
            to={item.href}
            end={item.href === '/dashboard'}
            children={({ isActive }) => (
              <div className={`${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} flex items-center w-full px-3 py-2 rounded-md`}>
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </div>
            )}
          >
          </NavLink>
        )
      })}
    </nav>
  )

  // =============================================================================
  // COMPONENTE SIDEBAR
  // =============================================================================

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-background border-r border-border">
      {/* Logo/Brand */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Monitor className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">i9 Smart</span>
            <span className="text-xs text-muted-foreground">Feed</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <NavigationItems />
      </div>
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 lg:px-6 h-16 flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas, relatórios..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notificações</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user?.full_name || user?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="text-xs text-muted-foreground mb-1">Paleta</div>
                  <div className="flex gap-1">
                    {(['blue','emerald','violet','rose','amber'] as ThemePalette[]).map(p => (
                      <button
                        key={p}
                        onClick={() => changePalette(p)}
                        className={`h-5 w-5 rounded-full border ${palette===p?'ring-2 ring-primary':''}`}
                        style={{ backgroundColor: `hsl(${p==='blue'? '221.2 83.2% 53.3%' : p==='emerald'? '152.4 76.2% 39.8%' : p==='violet'? '258.3 89.5% 66.3%' : p==='rose'? '349.7 89.2% 60.2%' : '37.7 92.1% 50.2%'})` }}
                        aria-label={`Selecionar ${p}`}
                        title={p}
                      />
                    ))}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLogoutLoading ? 'Saindo...' : 'Sair'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
