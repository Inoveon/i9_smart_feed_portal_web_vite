import { ReactNode, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
// @ts-ignore
import logoImg from '@/assets/logo.png'

// Componentes UI (Shadcn)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Props do layout
interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
  showThemeToggle?: boolean
}

/**
 * LAYOUT PARA PÁGINAS DE AUTENTICAÇÃO (LOGIN/REGISTER)
 * 
 * Features:
 * - Layout centralizado e responsivo
 * - Card principal para formulários
 * - Logo e branding da empresa
 * - Background pattern sutil
 * - Toggle tema (opcional)
 * - Links para alternar entre páginas
 */
export function AuthLayout({ 
  children, 
  title, 
  description,
  showThemeToggle = true 
}: AuthLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Aplicar tema ao document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen flex bg-background">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(var(--muted)) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--muted)) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, hsl(var(--muted)) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle (opcional) */}
        {showThemeToggle && (
          <div className="absolute top-6 right-6">
            <Button
              variant="outline"
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
          </div>
        )}

        {/* Content Container */}
        <div className="mx-auto w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <img 
                src={logoImg} 
                alt="i9 Smart" 
                className="w-16 h-16 object-contain mb-4"
              />
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  i9 Smart Feed
                </h1>
                <p className="text-sm text-muted-foreground">
                  Portal de Gerenciamento
                </p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-border/50">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* Footer Links/Info */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              © 2025 i9 Smart. Todos os direitos reservados.
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Suporte
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Política de Privacidade
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Termos de Uso
              </a>
            </div>
          </div>

          {/* Version Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground/60">
              v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
    </div>
  )
}

/**
 * COMPONENTE PARA LINKS DE NAVEGAÇÃO ENTRE PÁGINAS DE AUTH
 */
interface AuthNavLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function AuthNavLink({ href, children, className = "" }: AuthNavLinkProps) {
  return (
    <a
      href={href}
      className={`text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline ${className}`}
    >
      {children}
    </a>
  )
}

/**
 * COMPONENTE PARA DIVISOR COM TEXTO (OR)
 */
interface AuthDividerProps {
  text?: string
}

export function AuthDivider({ text = "ou" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  )
}

/**
 * COMPONENTE PARA ALERTAS/MENSAGENS
 */
interface AuthAlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  children: ReactNode
}

export function AuthAlert({ type = 'info', children }: AuthAlertProps) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  }

  return (
    <div className={`p-3 rounded-md border text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}