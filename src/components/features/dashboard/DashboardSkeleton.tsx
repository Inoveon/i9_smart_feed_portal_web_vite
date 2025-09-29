/**
 * SKELETON PARA DASHBOARD
 * 
 * Loading state que mantém a mesma estrutura do dashboard
 * Usa componentes Skeleton do Shadcn
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AppLayout } from '@/components/layouts/AppLayout'

export function DashboardSkeleton() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" /> {/* Título */}
            <Skeleton className="h-4 w-96" /> {/* Subtítulo */}
          </div>
          <Skeleton className="h-10 w-40" /> {/* Botão */}
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" /> {/* Título do card */}
                <Skeleton className="h-4 w-4" />   {/* Ícone */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" /> {/* Valor */}
                <Skeleton className="h-3 w-24 mb-2" /> {/* Descrição */}
                <div className="flex items-center pt-1">
                  <Skeleton className="h-3 w-3 mr-1" /> {/* Ícone trend */}
                  <Skeleton className="h-3 w-20" />     {/* Texto trend */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campanhas Ativas Skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" /> {/* Título */}
                <Skeleton className="h-4 w-48" /> {/* Descrição */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Campanhas skeleton */}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" /> {/* Nome campanha */}
                        <Skeleton className="h-4 w-56" /> {/* Detalhes */}
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-12" /> {/* Status */}
                        <Skeleton className="h-3 w-16" /> {/* Tempo */}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Skeleton className="h-9 w-full" /> {/* Botão */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente Skeleton */}
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" /> {/* Título */}
                <Skeleton className="h-4 w-40" /> {/* Descrição */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="bg-muted rounded-full p-2">
                        <Skeleton className="w-4 h-4" /> {/* Ícone */}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" /> {/* Título atividade */}
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" /> {/* Ícone clock */}
                          <Skeleton className="h-3 w-16" /> {/* Tempo */}
                          <Skeleton className="h-3 w-1" />  {/* Separador */}
                          <Skeleton className="h-3 w-12" /> {/* Usuário */}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Skeleton className="h-8 w-full" /> {/* Botão */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" /> {/* Título */}
            <Skeleton className="h-4 w-64" /> {/* Descrição */}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-auto p-6 border rounded-md">
                  <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-8 w-8 rounded" /> {/* Ícone */}
                    <Skeleton className="h-4 w-24" />       {/* Texto */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Section Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" /> {/* Título */}
            <Skeleton className="h-4 w-56" /> {/* Descrição */}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />  {/* Ícone */}
                  <Skeleton className="h-9 flex-1" /> {/* Botão */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}