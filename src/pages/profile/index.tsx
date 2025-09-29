import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
// import { useAuthStore } from '@/stores/auth.store'
import { useUpdateMe } from '@/services/auth.service'
import { toast } from 'sonner'
import { applyTheme, applyPalette, getSavedTheme, getSavedPalette, type ThemeMode, type ThemePalette } from '@/lib/theme'
import { ChangePasswordForm } from '@/components/features/auth/ChangePasswordForm'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Informe seu nome').optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user } = useAuth()
  // Atualização do usuário é feita pelo hook useUpdateMe -> setUser
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || '' },
  })

  useEffect(() => {
    form.reset({ full_name: user?.full_name || '' })
  }, [user, form])

  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme() ?? 'light')
  const [palette, setPalette] = useState<ThemePalette>(getSavedPalette() ?? 'blue')

  const updateMe = useUpdateMe()
  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateMe.mutateAsync({ full_name: data.full_name || undefined })
    } catch (e: any) {
      // toast tratado no hook
    }
  }

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode)
    applyTheme(mode)
  }

  const handlePaletteChange = (p: ThemePalette) => {
    setPalette(p)
    applyPalette(p)
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dados do Usuário */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Usuário</Label>
                      <Input value={user?.username || ''} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user?.email || ''} disabled />
                    </div>
                  </div>

                  <FormField name="full_name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex gap-3">
                    <Button type="submit">Salvar</Button>
                    <Button type="button" variant="outline" onClick={() => form.reset({ full_name: user?.full_name || '' })}>Cancelar</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant={theme==='light'?'default':'outline'} size="sm" onClick={() => handleThemeChange('light')}>Claro</Button>
                  <Button variant={theme==='dark'?'default':'outline'} size="sm" onClick={() => handleThemeChange('dark')}>Escuro</Button>
                </div>
              </div>

              <div>
                <Label>Paleta</Label>
                <div className="flex gap-2 mt-2">
                  {(['blue','emerald','violet','rose','amber'] as ThemePalette[]).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePaletteChange(p)}
                      className={`h-7 w-7 rounded-full border ${palette===p?'ring-2 ring-primary':''}`}
                      style={{ backgroundColor: `hsl(${p==='blue'? '221.2 83.2% 53.3%' : p==='emerald'? '152.4 76.2% 39.8%' : p==='violet'? '258.3 89.5% 66.3%' : p==='rose'? '349.7 89.2% 60.2%' : '37.7 92.1% 50.2%'})` }}
                      aria-label={`Selecionar ${p}`}
                      title={p}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm onSuccess={() => toast.success('Senha alterada com sucesso')} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default ProfilePage
