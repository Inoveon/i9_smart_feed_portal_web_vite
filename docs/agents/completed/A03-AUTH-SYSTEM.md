# A03 - Sistema de Autenticação

## 📋 Objetivo
Implementar sistema completo de autenticação com JWT, login, guards de rota e interceptors.

## 📚 Referências
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Seção 2 (Authentication)
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 🎯 Tarefas

### 1. Criar Serviço de Autenticação
```typescript
// src/services/auth.service.ts
interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    email: string
  }
}

class AuthService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://10.0.10.116:8000/api'
  
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await axios.post(
      `${this.baseURL}/auth/login`,
      formData,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )
    
    return response.data
  }
  
  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refresh_token: refreshToken
    })
    return response.data
  }
  
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }
}

export const authService = new AuthService()
```

### 2. Criar Store de Autenticação (Zustand)
```typescript
// src/stores/auth.store.ts
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setTokens: (access: string, refresh: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  login: async (username, password) => {
    const response = await authService.login(username, password)
    
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    
    set({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      isAuthenticated: true
    })
  },
  
  logout: () => {
    authService.logout()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    })
  },
  
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    set({ accessToken: access, refreshToken: refresh })
  }
}))
```

### 3. Configurar Axios Interceptors
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://10.0.10.116:8000/api'
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor com refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await authService.refresh(refreshToken)
          useAuthStore.getState().setTokens(
            response.access_token,
            response.refresh_token
          )
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
```

### 4. Criar Página de Login
```typescript
// src/pages/auth/login.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const loginSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })
  
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data.username, data.password)
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error) {
      toast.error('Credenciais inválidas')
    }
  }
  
  return (
    <AuthLayout>
      <Card className="w-[420px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            i9 Smart Campaigns
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
```

### 5. Criar Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}
```

### 6. Configurar Rotas
```typescript
// src/App.tsx
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<CampaignFormPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

## ✅ Checklist de Validação
- [ ] Login funcionando com API real
- [ ] Tokens salvos no localStorage
- [ ] Interceptor adicionando token no header
- [ ] Refresh token automático funcionando
- [ ] Rotas protegidas redirecionando
- [ ] Logout limpando estado
- [ ] Formulário com validação
- [ ] Mensagens de erro/sucesso

## 📊 Resultado Esperado
- Login conectando na API http://10.0.10.116:8000/api
- Redirecionamento após login bem-sucedido
- Token JWT sendo enviado nas requisições
- Refresh automático quando token expira
- Proteção de rotas funcionando

## 🚨 Pontos de Atenção
- SEMPRE usar application/x-www-form-urlencoded para login
- NÃO fazer log de tokens
- Implementar refresh token corretamente
- Validar formulários com Zod## 📚 Documentação de Referência

**IMPORTANTE:** Sempre consulte `docs/agents/shared/REACT-VITE-STANDARDS.md` para padrões de código obrigatórios antes de implementar.
