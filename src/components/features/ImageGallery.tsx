/**
 * GALERIA DE IMAGENS DA CAMPANHA
 * 
 * Componente para exibir e gerenciar imagens de uma campanha
 * Baseado na API documentation: CampaignImage interface
 * 
 * Funcionalidades:
 * - Exibição em grid responsivo
 * - Reordenação por drag & drop
 * - Exclusão de imagens
 * - Modal de visualização
 * - Informações de cada imagem
 */

import { useCallback } from 'react'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS as DndCSS } from '@dnd-kit/utilities'
import { 
  Trash2, 
  GripVertical, 
  Eye, 
  Clock, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Service
import { 
  useCampaignImages, 
  useReorderImages, 
  useDeleteImage,
  type CampaignImage 
} from '@/services/campaigns.service'

interface ImageGalleryProps {
  campaignId: string
}

interface SortableImageCardProps {
  image: CampaignImage
  onDelete: (imageId: string) => void
}

// Componente de card de imagem sortável
function SortableImageCard({ image, onDelete }: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // const formatFileSize = (bytes?: number | null) => {
  //   if (!bytes) return 'N/A'
  //   const MB = bytes / 1024 / 1024
  //   return `${MB.toFixed(1)}MB`
  // }

  const formatDisplayTime = (ms?: number | null) => {
    if (!ms) return 'Padrão'
    return `${(ms / 1000).toFixed(1)}s`
  }

  // Função para construir URL completa da imagem
  const getImageUrl = (url: string) => {
    // Se já for URL absoluta, retornar como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Se for relativa, adicionar o domínio da API
    // Em produção, o nginx faz proxy mas precisamos da URL completa para imagens
    const apiBase = import.meta.env.DEV ? 'http://localhost:8000' : 'http://172.16.2.90:8000'
    return `${apiBase}${url}`
  }

  return (
    <Card ref={setNodeRef} style={style} className="relative group">
      <CardContent className="p-3">
        {/* Handle para drag */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <div className="bg-background/80 backdrop-blur-sm p-1 rounded">
            <GripVertical className="h-4 w-4" />
          </div>
        </div>

        {/* Preview da imagem */}
        <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden relative">
          {(() => { const t = image.title ?? image.original_filename ?? 'Imagem da campanha';
          return (
          <img
            src={getImageUrl(image.url)}
            alt={t}
            className="w-full h-full object-cover"
          />) })()}
          
          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {image.title || image.original_filename || 'Imagem da campanha'}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {(() => { const t = image.title ?? image.original_filename ?? 'Imagem da campanha';
                  return (
                  <img
                    src={getImageUrl(image.url)}
                    alt={t}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />) })()}
                  
                  {image.description && (
                    <p className="mt-4 text-muted-foreground">
                      {image.description}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(image.id)}
            >
              <Trash2 className="h-4 w-4" />
              </Button>
          </div>

          {/* Badge de ordem */}
          <Badge className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm">
            #{image.order + 1}
          </Badge>
        </div>

        {/* Informações da imagem */}
        <div className="space-y-2">
          {(() => { const t = image.title ?? image.original_filename ?? 'Sem título';
          return (
          <h4 className="font-medium text-sm truncate" title={t}>
            {t}
          </h4>) })()}
          
          <div className="flex flex-wrap gap-1 text-xs">
            {/* TODO: Remover ou tratar quando API retornar size_bytes corretamente */}
            {/* Por enquanto comentado pois API retorna null para size_bytes
            <Badge variant="outline" className="flex items-center gap-1">
              <FileImage className="h-3 w-3" />
              {formatFileSize(image.size_bytes)}
            </Badge>
            */}
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDisplayTime(image.display_time)}
            </Badge>

            {image.width && image.height && (
              <Badge variant="outline">
                {image.width}×{image.height}
              </Badge>
            )}
            
            {image.active === false && (
              <Badge variant="destructive">
                Inativa
              </Badge>
            )}
          </div>

          {image.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {image.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ImageGallery({ campaignId }: ImageGalleryProps) {
  const { data: images, isLoading, error } = useCampaignImages(campaignId)
  const reorderMutation = useReorderImages()
  const deleteMutation = useDeleteImage()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Inicializar ordem das imagens
  const sortedImages = images ? [...images].sort((a, b) => a.order - b.order) : []

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedImages.findIndex(img => img.id === active.id)
      const newIndex = sortedImages.findIndex(img => img.id === over.id)

      const newOrder = arrayMove(sortedImages, oldIndex, newIndex)
      const newImageIds = newOrder.map(img => img.id)

      // Enviar para API
      reorderMutation.mutate({ campaignId, imageIds: newImageIds })
    }
  }, [campaignId, sortedImages, reorderMutation])

  // Handle delete image
  const handleDeleteImage = useCallback((imageId: string) => {
    if (confirm('Tem certeza que deseja remover esta imagem?')) {
      deleteMutation.mutate({ imageId, campaignId })
    }
  }, [deleteMutation, campaignId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagens da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="aspect-video w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar imagens: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!images || !images.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagens da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nenhuma imagem encontrada.</strong> Quando o sistema de imagens estiver 
              disponível, as imagens desta campanha aparecerão aqui.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imagens da Campanha ({images?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedImages.map(img => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedImages.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  onDelete={handleDeleteImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Loading state para operações */}
        {(reorderMutation.isPending || deleteMutation.isPending) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {reorderMutation.isPending && 'Reordenando imagens...'}
              {deleteMutation.isPending && 'Removendo imagem...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
