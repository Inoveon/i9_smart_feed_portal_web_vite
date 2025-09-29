/**
 * ROLE GUARD - Proteção baseada em roles/permissões
 * 
 * Funcionalidades:
 * - Verifica role do usuário
 * - Suporte a múltiplas roles (OR logic)
 * - Permissões granulares (can_read, can_write, etc)
 * - Fallback customizável para sem permissão
 * - Integração com AuthGuard
 * 
 * USO:
 * <RoleGuard role="admin">
 *   <AdminComponent />
 * </RoleGuard>
 * 
 * <RoleGuard roles={["admin", "manager"]}>
 *   <ManagerComponent />
 * </RoleGuard>
 */

import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { User } from '@/types/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react'

// Tipos de roles baseados na API real
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'

// Permissões granulares
export interface Permissions {
  campaigns: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  images: {
    upload: boolean
    delete: boolean
    manage: boolean
  }
  stations: {
    create: boolean
    update: boolean
    delete: boolean
  }
  analytics: {
    view: boolean
    export: boolean
  }
  settings: {
    access: boolean
    modify: boolean
  }
  users: {
    manage: boolean
    view: boolean
  }
}

// Mapa de permissões por role
const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    campaigns: { create: true, read: true, update: true, delete: true },
    images: { upload: true, delete: true, manage: true },
    stations: { create: true, update: true, delete: true },
    analytics: { view: true, export: true },
    settings: { access: true, modify: true },
    users: { manage: true, view: true },
  },
  manager: {
    campaigns: { create: true, read: true, update: true, delete: false },
    images: { upload: true, delete: false, manage: true },
    stations: { create: true, update: true, delete: false },
    analytics: { view: true, export: true },
    settings: { access: true, modify: false },
    users: { manage: false, view: true },
  },
  operator: {
    campaigns: { create: true, read: true, update: true, delete: false },
    images: { upload: true, delete: false, manage: false },
    stations: { create: false, update: true, delete: false },
    analytics: { view: true, export: false },
    settings: { access: false, modify: false },
    users: { manage: false, view: false },
  },
  viewer: {
    campaigns: { create: false, read: true, update: false, delete: false },
    images: { upload: false, delete: false, manage: false },
    stations: { create: false, update: false, delete: false },
    analytics: { view: true, export: false },
    settings: { access: false, modify: false },
    users: { manage: false, view: false },
  },
}

interface RoleGuardProps {
  children: ReactNode
  role?: UserRole
  roles?: UserRole[]
  permission?: {
    resource: keyof Permissions
    action: string
  }
  fallback?: ReactNode
  showFallback?: boolean
}

/**
 * Componente de fallback para sem permissão
 */
function NoPermissionFallback({ missingRole, missingPermission }: {
  missingRole?: string
  missingPermission?: string
}) {
  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {missingRole && (
                <>Você precisa do role <strong>{missingRole}</strong> para acessar esta área.</>
              )}
              {missingPermission && (
                <>Você não tem permissão para <strong>{missingPermission}</strong>.</>
              )}
              {!missingRole && !missingPermission && (
                <>Você não tem permissão para acessar esta área.</>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="text-center text-sm text-muted-foreground">
            Entre em contato com o administrador se acredita que isso é um erro.
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="default" 
              className="w-full"
            >
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function RoleGuard({
  children,
  role,
  roles,
  permission,
  fallback,
  showFallback = true,
}: RoleGuardProps) {
  const { user } = useAuthStore()

  // Se não há usuário, não renderizar nada (AuthGuard deve handle isso)
  if (!user) {
    return null
  }

  // Verificar role específico
  if (role && !hasRole(user, role)) {
    if (!showFallback) return null
    return fallback || <NoPermissionFallback missingRole={role} />
  }

  // Verificar múltiplos roles (OR logic)
  if (roles && !roles.some(r => hasRole(user, r))) {
    if (!showFallback) return null
    return fallback || <NoPermissionFallback missingRole={roles.join(' ou ')} />
  }

  // Verificar permissão específica
  if (permission && !hasPermission(user, permission.resource, permission.action)) {
    if (!showFallback) return null
    return fallback || <NoPermissionFallback missingPermission={`${permission.action} em ${permission.resource}`} />
  }

  // Usuário tem permissão - renderizar children
  return <>{children}</>
}

/**
 * Verificar se usuário tem role específico
 */
export function hasRole(user: User, role: UserRole): boolean {
  return user.role === role || (role !== 'admin' && user.role === 'admin')
}

/**
 * Verificar permissão específica
 */
export function hasPermission(
  user: User,
  resource: keyof Permissions,
  action: string
): boolean {
  const userRole = user.role as UserRole
  const permissions = ROLE_PERMISSIONS[userRole]
  
  if (!permissions || !permissions[resource]) {
    return false
  }

  const resourcePermissions = permissions[resource] as any
  return resourcePermissions[action] === true
}

/**
 * Obter todas as permissões do usuário
 */
export function getUserPermissions(user: User): Permissions {
  const userRole = user.role as UserRole
  return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.viewer
}

/**
 * Hook para usar permissões em componentes
 */
export function usePermissions() {
  const { user } = useAuthStore()
  
  if (!user) {
    return {
      hasRole: () => false,
      hasPermission: () => false,
      permissions: ROLE_PERMISSIONS.viewer,
      canAccess: () => false,
    }
  }

  return {
    hasRole: (role: UserRole) => hasRole(user, role),
    hasPermission: (resource: keyof Permissions, action: string) => 
      hasPermission(user, resource, action),
    permissions: getUserPermissions(user),
    canAccess: (resource: keyof Permissions, action: string) =>
      hasPermission(user, resource, action),
  }
}

/**
 * HOC para proteger componentes com roles
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RoleGuardProps, 'children'>
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGuard {...options}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}

/**
 * Exemplo de uso:
 * 
 * // Proteger por role
 * <RoleGuard role="admin">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * // Múltiplos roles
 * <RoleGuard roles={["admin", "manager"]}>
 *   <ManagerFeature />
 * </RoleGuard>
 * 
 * // Permissão específica
 * <RoleGuard permission={{ resource: "campaigns", action: "delete" }}>
 *   <DeleteButton />
 * </RoleGuard>
 * 
 * // Usar hook
 * function CampaignActions() {
 *   const { hasPermission, hasRole } = usePermissions()
 *   
 *   return (
 *     <div>
 *       {hasPermission("campaigns", "create") && <CreateButton />}
 *       {hasRole("admin") && <AdminSettings />}
 *     </div>
 *   )
 * }
 */