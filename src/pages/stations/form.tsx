import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '@/components/layouts/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { useStation, useCreateStation, useUpdateStation } from '@/services/stations.service'
import { useBranches } from '@/services/branches.service'
import { ArrowLeft, Save } from 'lucide-react'

const stationSchema = z.object({
  code: z.string().min(1, 'Código obrigatório'),
  name: z.string().min(3, 'Nome obrigatório'),
  branch_id: z.string().min(1, 'Filial é obrigatória'),
  address: z.string().optional().default(''),
  is_active: z.boolean().default(true),
})

type StationFormData = z.infer<typeof stationSchema>

export function StationFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const { data: station, isLoading: loadingStation } = useStation(id || '')
  const { data: branches } = useBranches()
  const createMutation = useCreateStation()
  const updateMutation = useUpdateStation()

  const form = useForm<StationFormData>({
    resolver: zodResolver(stationSchema),
    defaultValues: { code: '', name: '', branch_id: '', address: '', is_active: true }
  })

  useEffect(() => {
    if (isEditing && station) {
      form.reset({
        code: station.code,
        name: station.name,
        branch_id: station.branch_id || station.branch?.id || '',
        address: station.address || '',
        is_active: station.is_active ?? true,
      })
    }
  }, [isEditing, station, form])

  const onSubmit = async (data: StationFormData) => {
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, payload: data as any })
      } else {
        await createMutation.mutateAsync(data as any)
      }
      navigate('/stations')
    } catch {}
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (isEditing && loadingStation) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/stations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Editar Estação' : 'Nova Estação'}</h1>
            <p className="text-muted-foreground">Informe os dados da estação</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Estação</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="code" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="001" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Posto Central" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="branch_id" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filial</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a filial" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(branches || []).map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.code} — {b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField name="is_active" control={form.control} render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                      <FormLabel>Ativa</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/stations')} disabled={isSubmitting}>Cancelar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default StationFormPage

