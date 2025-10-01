/**
 * FORMULÁRIO DE CAMPANHA
 * 
 * Implementação usando EXCLUSIVAMENTE dados reais da API
 * Baseado nos campos confirmados nos testes de endpoints
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

// Hooks do service (já implementados e testados)
import { 
  useCreateCampaign, 
  useUpdateCampaign, 
  useCampaign,
  CreateCampaignDTO 
} from '@/services/campaigns.service'

// Layout
import { AppLayout } from '@/components/layouts/AppLayout'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TargetingSelector, TargetingValue } from '@/components/features/TargetingSelector'

// Schema baseado APENAS em campos confirmados da API
const campaignFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['active', 'scheduled', 'paused']).default('active'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  default_display_time: z.number().min(1000).max(60000).default(5000),
  regions: z.array(z.string()).default([]),
  branches: z.array(z.string()).default([]),
  stations: z.array(z.string()).default([]),
  priority: z.number().min(0).max(100).default(0),
}).refine((data) => {
  // Validar se data de fim é depois da data de início
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate > startDate
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["end_date"]
})

type CampaignFormData = z.infer<typeof campaignFormSchema>

export function CampaignForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  // Hooks para dados reais da API
  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id || '')
  const createMutation = useCreateCampaign()
  const updateMutation = useUpdateCampaign()

  // Form setup
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      start_date: '',
      end_date: '',
      default_display_time: 5000,
      regions: [],
      branches: [],
      stations: [],
      priority: 0,
    }
  })

  // Carregar dados da campanha para edição usando dados REAIS da API
  useEffect(() => {
    if (isEditing && campaign) {
      // Converter os dados da API para o formato do formulário
      const formData: CampaignFormData = {
        name: campaign.name,
        description: campaign.description || '',
        status: (campaign.status as 'active' | 'scheduled' | 'paused') || 'active',
        start_date: campaign.start_date 
          ? new Date(campaign.start_date).toISOString().split('T')[0] 
          : '',
        end_date: campaign.end_date 
          ? new Date(campaign.end_date).toISOString().split('T')[0] 
          : '',
        default_display_time: campaign.default_display_time,
        regions: campaign.regions || [],
        branches: campaign.branches || [],
        stations: campaign.stations || [],
        priority: campaign.priority,
      }

      form.reset(formData)
    }
  }, [campaign, isEditing, form])

  // Submit handler
  const onSubmit = async (data: CampaignFormData) => {
    try {
      // Converter datas para formato ISO com horário
      const submitData: CreateCampaignDTO = {
        ...data,
        start_date: new Date(data.start_date + 'T00:00:00.000Z').toISOString(),
        end_date: new Date(data.end_date + 'T23:59:59.999Z').toISOString(),
      }

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data: submitData })
      } else {
        await createMutation.mutateAsync(submitData)
      }

      // Navegar de volta para a listagem
      navigate('/campaigns')
    } catch (error) {
      // Erros já são tratados pelos hooks
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Loading state para edição
  if (isEditing && loadingCampaign) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? 'Atualize os dados da campanha existente' 
                : 'Crie uma nova campanha de marketing digital'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Campanha</CardTitle>
            <CardDescription>
              Preencha os dados para {isEditing ? 'atualizar' : 'criar'} a campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Campanha *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome da campanha" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o objetivo da campanha"
                          className="min-h-[80px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição opcional para identificar melhor a campanha
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="paused">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fim *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Display Time e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="default_display_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de Exibição (ms)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={1000}
                            max={60000}
                            step={500}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          De 1000ms (1s) até 60000ms (60s). Padrão: 5000ms (5s)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          De 0 (baixa) até 100 (máxima). Padrão: 0
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Targeting */}
                <TargetingSelector
                  value={{
                    mode: (form.watch('regions').length || form.watch('branches').length || form.watch('stations').length)
                      ? (form.watch('stations').length ? 'stations' : (form.watch('branches').length ? 'branches' : 'regions'))
                      : 'global',
                    regions: form.watch('regions'),
                    branches: form.watch('branches'),
                    stations: form.watch('stations'),
                  } as TargetingValue}
                  onChange={(next) => {
                    console.log('TargetingSelector onChange:', next)
                    if (next.mode === 'global') {
                      form.setValue('regions', [])
                      form.setValue('branches', [])
                      form.setValue('stations', [])
                    } else {
                      form.setValue('regions', next.regions)
                      form.setValue('branches', next.branches)
                      form.setValue('stations', next.stations)
                    }
                  }}
                  disabled={isSubmitting}
                />

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-none"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting 
                      ? (isEditing ? 'Atualizando...' : 'Criando...') 
                      : (isEditing ? 'Atualizar Campanha' : 'Criar Campanha')
                    }
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/campaigns')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
