/**
 * PÁGINA DE GERENCIAMENTO DE IMAGENS
 * 
 * Página dedicada para gerenciar imagens de uma campanha específica
 * Combina upload e galeria em uma interface intuitiva
 */

import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Layout
import { AppLayout } from '@/components/layouts/AppLayout'

// Components
import { ImageUploader } from '@/components/features/ImageUploader'
import { ImageGallery } from '@/components/features/ImageGallery'

// Service
import { useCampaign } from '@/services/campaigns.service'

// Utils
import { translateCampaignStatus } from '@/lib/utils'

export function CampaignImagesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: campaign, isLoading, error } = useCampaign(id!)

  const handleUploadComplete = () => {
    // A galeria será atualizada automaticamente via React Query
    // devido à invalidação de cache no hook useUploadImages
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !campaign) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>
              {error?.message || 'Campanha não encontrada'}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">
                  Gerenciar Imagens
                </h1>
                <p className="text-muted-foreground">
                  {campaign.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Informações da campanha */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Status:</span>
              <p className="capitalize">{translateCampaignStatus(campaign.status || '')}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Tempo padrão:</span>
              <p>{(campaign.default_display_time / 1000).toFixed(1)}s por imagem</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Imagens atuais:</span>
              <p>{campaign.images?.length || 0} imagem(ns)</p>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload */}
          <div className="space-y-6">
            <ImageUploader
              campaignId={campaign.id}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Galeria */}
          <div className="space-y-6">
            <ImageGallery campaignId={campaign.id} />
          </div>
        </div>

        {/* Regras e informações */}
        <div className="mt-8">
          <Alert>
            <ImageIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Regras para imagens:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Formatos aceitos: JPG, PNG, WEBP</li>
                <li>• Tamanho máximo: 10MB por arquivo</li>
                <li>• Até 20 imagens por campanha</li>
                <li>• Arraste para reordenar (quando disponível)</li>
                <li>• Cada imagem pode ter tempo de exibição personalizado</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </AppLayout>
  )
}