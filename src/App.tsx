import { useEffect, lazy, Suspense } from 'react'
import { initThemeAndPalette } from '@/lib/theme'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Guards
import { AuthGuard } from '@/components/guards/AuthGuard'

// Pages
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
const DashboardPage = lazy(() => import('@/pages/dashboard').then(m => ({ default: m.DashboardPage })))
const CampaignsPage = lazy(() => import('@/pages/campaigns').then(m => ({ default: m.CampaignsPage })))
const CampaignForm = lazy(() => import('@/pages/campaigns/form').then(m => ({ default: m.CampaignForm })))
const CampaignImagesPage = lazy(() => import('@/pages/campaigns/images/[id]').then(m => ({ default: m.CampaignImagesPage })))
const ProfilePage = lazy(() => import('@/pages/profile').then(m => ({ default: m.ProfilePage })))
const AnalyticsPage = lazy(() => import('@/pages/analytics').then(m => ({ default: m.AnalyticsPage })))
const ActivitiesPage = lazy(() => import('@/pages/activities'))
const UsersPage = lazy(() => import('@/pages/users'))
// Importar diretamente páginas de Filiais/Estações para evitar atrasos de lazy
import BranchesPage from '@/pages/branches'
import StationsPage from '@/pages/stations'
import BranchFormPage from '@/pages/branches/form'
import StationFormPage from '@/pages/stations/form'

// Components
import { SessionTimeout } from '@/components/features/auth/SessionTimeout'

// =============================================================================
// CONFIGURAÇÃO DO REACT QUERY
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// =============================================================================
// COMPONENTE DE LOADING GLOBAL (removido - não usado)
// =============================================================================

// =============================================================================
// COMPONENTE PARA REDIRECT APÓS LOGIN (removido - não usado)
// =============================================================================

// =============================================================================
// ROTEADOR PRINCIPAL COM REACT ROUTER
// =============================================================================

function AppRouter() {
  return (
    <Routes>
      {/* Rota raiz - redireciona para dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Rotas de autenticação (públicas) */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      
      {/* Rotas protegidas */}
      <Route 
        path="/dashboard/*" 
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <DashboardPage />
            </Suspense>
          </AuthGuard>
        } 
      />

      {/* Filiais e Estações */}
      <Route 
        path="/branches" 
        element={
          <AuthGuard>
            <BranchesPage />
          </AuthGuard>
        } 
      />
      <Route 
        path="/branches/new" 
        element={
          <AuthGuard>
            <BranchFormPage />
          </AuthGuard>
        } 
      />
      <Route 
        path="/branches/:id/edit" 
        element={
          <AuthGuard>
            <BranchFormPage />
          </AuthGuard>
        } 
      />
      <Route 
        path="/stations" 
        element={
          <AuthGuard>
            <StationsPage />
          </AuthGuard>
        } 
      />
      <Route 
        path="/stations/new" 
        element={
          <AuthGuard>
            <StationFormPage />
          </AuthGuard>
        } 
      />
      <Route 
        path="/stations/:id/edit" 
        element={
          <AuthGuard>
            <StationFormPage />
          </AuthGuard>
        } 
      />
      
      {/* Rotas de campanhas */}
      <Route 
        path="/campaigns" 
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <CampaignsPage />
            </Suspense>
          </AuthGuard>
        } 
      />
      <Route 
        path="/campaigns/new" 
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <CampaignForm />
            </Suspense>
          </AuthGuard>
        } 
      />
      <Route 
        path="/campaigns/:id/edit" 
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <CampaignForm />
            </Suspense>
          </AuthGuard>
        } 
      />
      <Route 
        path="/campaigns/:id/images" 
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <CampaignImagesPage />
            </Suspense>
          </AuthGuard>
        } 
      />

      {/* Perfil */}
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <ProfilePage />
            </Suspense>
          </AuthGuard>
        }
      />
      
      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <AnalyticsPage />
            </Suspense>
          </AuthGuard>
        }
      />
      
      {/* Activities */}
      <Route
        path="/activities"
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <ActivitiesPage />
            </Suspense>
          </AuthGuard>
        }
      />
      
      {/* Users - Admin only */}
      <Route
        path="/users"
        element={
          <AuthGuard>
            <Suspense fallback={<div className="p-6">Carregando...</div>}>
              <UsersPage />
            </Suspense>
          </AuthGuard>
        }
      />
      
      {/* Redirect para rotas não encontradas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

// =============================================================================
// COMPONENTE APP PRINCIPAL
// =============================================================================

function App() {
  // Inicializar tema + paleta persistidos
  useEffect(() => {
    initThemeAndPalette()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          {/* Router principal */}
          <AppRouter />
          
          {/* Componente de timeout de sessão */}
          <SessionTimeout />
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
