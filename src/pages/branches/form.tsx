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

import { useBranch, useBranchRegions, useCreateBranch, useUpdateBranch } from '@/services/branches.service'
import { ArrowLeft, Save } from 'lucide-react'

const branchSchema = z.object({
  code: z.string().min(3, 'Código obrigatório'),
  name: z.string().min(3, 'Nome obrigatório'),
  city: z.string().optional().default(''),
  state: z.string().min(2, 'UF obrigatória'),
  is_active: z.boolean().default(true),
})

type BranchFormData = z.infer<typeof branchSchema>

export function BranchFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const { data: regionsData } = useBranchRegions()
  const { data: branch, isLoading: loadingBranch } = useBranch(id || '')
  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: { code: '', name: '', city: '', state: '', is_active: true }
  })

  useEffect(() => {
    if (isEditing && branch) {
      form.reset({
        code: branch.code,
        name: branch.name,
        city: branch.city || '',
        state: branch.state,
        is_active: branch.is_active ?? true,
      })
    }
  }, [isEditing, branch, form])

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, payload: data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/branches')
    } catch {}
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (isEditing && loadingBranch) {
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

  const allStates = (() => {
    const statesSet = new Set<string>()
    const sbr = regionsData?.states_by_region || {}
    Object.values(sbr).forEach(list => list.forEach(uf => statesSet.add(uf)))
    return Array.from(statesSet).sort()
  })()

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/branches')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Editar Filial' : 'Nova Filial'}</h1>
            <p className="text-muted-foreground">Informe os dados da filial</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Filial</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="code" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="010101" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Filial São Paulo 01" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="city" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="state" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allStates.map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <Button type="button" variant="outline" onClick={() => navigate('/branches')} disabled={isSubmitting}>Cancelar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default BranchFormPage
