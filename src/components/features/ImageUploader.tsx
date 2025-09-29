/**
 * COMPONENTE DE UPLOAD DE IMAGENS
 * 
 * Componente para upload de múltiplas imagens para campanhas
 * Baseado na API documentation: CampaignImage interface
 * 
 * Funcionalidades:
 * - Upload múltiplo (até 20 imagens)
 * - Preview antes do upload
 * - Validação de formato (JPG, JPEG, PNG, WEBP)
 * - Validação de tamanho (10MB max)
 * - Progress tracking
 */

import { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

// Service
import { useUploadImages } from '@/services/campaigns.service'

interface ImageUploaderProps {
  campaignId: string
  disabled?: boolean
  maxFiles?: number
  onUploadComplete?: () => void
}

interface FileWithPreview extends File {
  preview: string
  id: string
}

export function ImageUploader({ 
  campaignId, 
  disabled = false, 
  maxFiles = 20,
  onUploadComplete 
}: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const uploadMutation = useUploadImages()

  // Configuração do dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    onDrop: useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Tratar arquivos rejeitados
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMessages = errors.map((error: { code: string; message: string }) => {
            switch (error.code) {
              case 'file-too-large':
                return `${file.name}: Arquivo muito grande (máx: 10MB)`
              case 'file-invalid-type':
                return `${file.name}: Formato não suportado (use JPG, PNG ou WEBP)`
              case 'too-many-files':
                return `Máximo ${maxFiles} arquivos permitidos`
              default:
                return `${file.name}: ${error.message}`
            }
          }).join(', ')
          toast.error(errorMessages)
        })
      }

      // Adicionar arquivos aceitos com preview
      const newFiles = acceptedFiles.map(file => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9)
        }) as FileWithPreview
        return fileWithPreview
      })

      setFiles(prev => [...prev, ...newFiles])
    }, [maxFiles])
  })

  // Remover arquivo da lista
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId)
      // Limpar URL de preview para evitar memory leak
      const removed = prev.find(file => file.id === fileId)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  // Upload dos arquivos
  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos uma imagem')
      return
    }

    try {
      await uploadMutation.mutateAsync({ 
        campaignId, 
        files: files.map(f => new File([f], f.name, { type: f.type }))
      })
      
      // Limpar arquivos após sucesso
      files.forEach(file => URL.revokeObjectURL(file.preview))
      setFiles([])
      onUploadComplete?.()
    } catch (error) {
      // Error já tratado no hook
    }
  }, [campaignId, files, uploadMutation, onUploadComplete])

  // Limpeza na desmontagem
  useState(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Upload de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de funcionalidade */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidade em desenvolvimento:</strong> O upload de imagens estará 
            disponível em breve. Esta interface está pronta mas aguarda implementação no backend.
          </AlertDescription>
        </Alert>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          
          {isDragActive ? (
            <p className="text-primary font-medium">Solte as imagens aqui...</p>
          ) : (
            <div>
              <p className="text-foreground font-medium">
                Clique aqui ou arraste imagens
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                JPG, PNG ou WEBP • Máx {maxFiles} arquivos • 10MB cada
              </p>
            </div>
          )}
        </div>

        {/* Preview dos arquivos */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Arquivos selecionados ({files.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  files.forEach(file => URL.revokeObjectURL(file.preview))
                  setFiles([])
                }}
              >
                Limpar tudo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(file.preview)}
                    />
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground truncate" title={file.name}>
                      {file.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress do upload */}
        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando imagens...</span>
              <span>Aguarde</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadMutation.isPending || disabled}
            className="flex-1"
          >
            {uploadMutation.isPending ? 'Enviando...' : `Enviar ${files.length} imagem(ns)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}