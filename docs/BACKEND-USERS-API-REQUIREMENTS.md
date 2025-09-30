# 📋 REQUISITOS DE API - MÓDULO DE USUÁRIOS

## 🎯 CONTEXTO

O portal administrativo **i9 Smart Feed** necessita de endpoints para gerenciamento completo de usuários. Atualmente a API possui apenas endpoints de autenticação (`/api/auth/*`), mas não possui CRUD de usuários para administradores gerenciarem outros usuários do sistema.

## 🔴 SITUAÇÃO ATUAL

### Endpoints Existentes
- ✅ `POST /api/auth/login` - Login
- ✅ `POST /api/auth/refresh` - Renovar token
- ✅ `GET /api/auth/me` - Perfil do usuário atual
- ✅ `PUT /api/auth/me` - Atualizar próprio perfil
- ✅ `PUT /api/auth/me/password` - Alterar própria senha
- ❌ **FALTAM: Endpoints para gerenciar outros usuários**

## 🟢 ENDPOINTS NECESSÁRIOS

### 1. LISTAR USUÁRIOS
```yaml
Endpoint: GET /api/users
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Query Parameters:
  - page: int (default: 1)
  - limit: int (default: 50, max: 100)
  - search: string (opcional, busca em username, email, full_name)
  - role: string (opcional, filtro por role: admin|editor|viewer)
  - is_active: boolean (opcional, filtro por status)
  - sort_by: string (default: 'created_at', opções: username|email|created_at|updated_at)
  - order: string (default: 'desc', opções: asc|desc)

Response 200:
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "role": "editor",
      "is_active": true,
      "is_verified": true,
      "last_login": "2025-01-30T10:00:00Z",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "total_pages": 3
  }
}

Response 401: Não autenticado
Response 403: Sem permissão (não é admin)
```

### 2. OBTER USUÁRIO ESPECÍFICO
```yaml
Endpoint: GET /api/users/{user_id}
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Path Parameters:
  - user_id: UUID do usuário

Response 200:
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "role": "editor",
  "is_active": true,
  "is_verified": true,
  "last_login": "2025-01-30T10:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-30T10:00:00Z",
  "preferences": {
    "theme": "dark",
    "palette": "blue"
  },
  "statistics": {
    "campaigns_created": 15,
    "last_activity": "2025-01-30T10:00:00Z"
  }
}

Response 401: Não autenticado
Response 403: Sem permissão
Response 404: Usuário não encontrado
```

### 3. CRIAR USUÁRIO
```yaml
Endpoint: POST /api/users
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Content-Type: application/json

Request Body:
{
  "email": "newuser@example.com",      // required, unique
  "username": "newuser",                // required, unique, min 3 chars
  "password": "SecurePass123!",        // required, min 8 chars
  "full_name": "New User",             // optional
  "role": "viewer",                     // required: admin|editor|viewer
  "is_active": true                     // optional, default: true
}

Response 201:
{
  "id": "uuid",
  "email": "newuser@example.com",
  "username": "newuser",
  "full_name": "New User",
  "role": "viewer",
  "is_active": true,
  "is_verified": false,
  "created_at": "2025-01-30T12:00:00Z",
  "updated_at": "2025-01-30T12:00:00Z"
}

Response 400: Dados inválidos
Response 401: Não autenticado
Response 403: Sem permissão
Response 409: Email ou username já existe
Response 422: Validação falhou
```

### 4. ATUALIZAR USUÁRIO
```yaml
Endpoint: PUT /api/users/{user_id}
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Content-Type: application/json
Path Parameters:
  - user_id: UUID do usuário

Request Body (todos campos opcionais):
{
  "email": "updated@example.com",
  "username": "updateduser",
  "full_name": "Updated Name",
  "role": "editor",
  "is_active": false,
  "is_verified": true
}

Response 200:
{
  "id": "uuid",
  "email": "updated@example.com",
  "username": "updateduser",
  "full_name": "Updated Name",
  "role": "editor",
  "is_active": false,
  "is_verified": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-30T13:00:00Z"
}

Response 400: Dados inválidos
Response 401: Não autenticado
Response 403: Sem permissão ou tentativa de alterar próprio role
Response 404: Usuário não encontrado
Response 409: Email ou username já existe
```

### 5. DESATIVAR/DELETAR USUÁRIO
```yaml
Endpoint: DELETE /api/users/{user_id}
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Path Parameters:
  - user_id: UUID do usuário

Comportamento: Soft delete (is_active = false)

Response 204: No Content (sucesso)

Response 401: Não autenticado
Response 403: Sem permissão ou tentativa de deletar a si mesmo
Response 404: Usuário não encontrado
```

### 6. RESETAR SENHA DE USUÁRIO
```yaml
Endpoint: PUT /api/users/{user_id}/password
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'
Content-Type: application/json
Path Parameters:
  - user_id: UUID do usuário

Request Body:
{
  "new_password": "NewSecurePass123!"  // required, min 8 chars
}

Response 200:
{
  "message": "Senha alterada com sucesso",
  "user_id": "uuid",
  "temporary_password": false
}

Response 400: Senha fraca
Response 401: Não autenticado
Response 403: Sem permissão
Response 404: Usuário não encontrado
```

### 7. ESTATÍSTICAS DE USUÁRIOS (OPCIONAL)
```yaml
Endpoint: GET /api/users/statistics
Autenticação: JWT (Bearer Token)
Permissão: role = 'admin'

Response 200:
{
  "total_users": 125,
  "users_by_role": {
    "admin": 2,
    "editor": 23,
    "viewer": 100
  },
  "active_users": 120,
  "inactive_users": 5,
  "verified_users": 118,
  "users_created_last_30_days": 15,
  "users_logged_in_last_7_days": 89
}

Response 401: Não autenticado
Response 403: Sem permissão
```

## 📝 VALIDAÇÕES OBRIGATÓRIAS

### Email
- Formato válido (RFC 5322)
- Único no sistema
- Máximo 255 caracteres
- Lowercase automático

### Username
- Mínimo 3 caracteres
- Máximo 50 caracteres
- Apenas letras, números, underscore e hífen
- Único no sistema
- Lowercase automático
- Regex: `^[a-z0-9_-]{3,50}$`

### Password
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (@$!%*?&)
- Não pode conter o username ou email

### Full Name
- Opcional
- Máximo 255 caracteres
- Trim automático

### Role
- Enum: `admin`, `editor`, `viewer`
- Não pode ser null

## 🔒 REGRAS DE NEGÓCIO

1. **Automodificação**
   - Admin NÃO pode alterar seu próprio `role`
   - Admin NÃO pode desativar sua própria conta
   - Admin NÃO pode deletar sua própria conta

2. **Último Admin**
   - Sistema deve ter sempre pelo menos 1 admin ativo
   - Validar antes de desativar/deletar/alterar role de admin

3. **Soft Delete**
   - DELETE não remove do banco, apenas seta `is_active = false`
   - Usuários inativos não podem fazer login
   - Usuários inativos não aparecem na listagem por padrão

4. **Auditoria**
   - Registrar quem criou/editou/deletou usuários
   - Manter log de alterações importantes (role, status)

5. **Email de Boas-vindas** (Opcional)
   - Ao criar usuário, enviar email com credenciais
   - Link para definir/confirmar senha

## 🔄 MIGRAÇÃO DE DADOS

### Estrutura da Tabela `users` Necessária
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    preferences JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

## 🧪 CASOS DE TESTE

### Teste 1: Criar Usuário
```bash
curl -X POST "http://localhost:8000/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@i9smart.com",
    "username": "teste_user",
    "password": "Test@123456",
    "full_name": "Usuário Teste",
    "role": "viewer"
  }'
```

### Teste 2: Listar com Filtros
```bash
curl -X GET "http://localhost:8000/api/users?role=editor&is_active=true&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Teste 3: Atualizar Role
```bash
curl -X PUT "http://localhost:8000/api/users/{user_id}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "editor"
  }'
```

### Teste 4: Resetar Senha
```bash
curl -X PUT "http://localhost:8000/api/users/{user_id}/password" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "NovaSenha@123"
  }'
```

## 📊 RESPOSTA DE ERROS PADRÃO

Todos os endpoints devem seguir o padrão de erro:
```json
{
  "detail": "Mensagem de erro em português",
  "type": "validation_error|permission_error|not_found|conflict",
  "field": "campo_com_erro" // opcional, para erros de validação
}
```

## 🚀 PRIORIDADE DE IMPLEMENTAÇÃO

1. **ALTA PRIORIDADE** (Essencial)
   - GET `/api/users` - Listar
   - POST `/api/users` - Criar
   - PUT `/api/users/{id}` - Atualizar
   - DELETE `/api/users/{id}` - Desativar

2. **MÉDIA PRIORIDADE** (Importante)
   - GET `/api/users/{id}` - Detalhes
   - PUT `/api/users/{id}/password` - Reset senha

3. **BAIXA PRIORIDADE** (Nice to have)
   - GET `/api/users/statistics` - Estatísticas
   - Email de boas-vindas
   - Log de auditoria detalhado

## 📅 CRONOGRAMA SUGERIDO

- **Dia 1-2**: Implementar endpoints básicos (CRUD)
- **Dia 3**: Adicionar validações e regras de negócio
- **Dia 4**: Testes e documentação Swagger
- **Dia 5**: Deploy e testes integrados

## 💡 OBSERVAÇÕES IMPORTANTES

1. **Compatibilidade**: Manter mesmo padrão de resposta dos endpoints existentes
2. **Performance**: Adicionar paginação obrigatória em listagens
3. **Segurança**: Hash de senha com bcrypt (cost factor 12)
4. **Cache**: Invalidar cache de usuário ao alterar dados
5. **Logs**: Registrar todas operações críticas

## 📞 CONTATO

Para dúvidas sobre os requisitos:
- **Frontend**: Portal i9 Smart Feed
- **Prioridade**: Alta - Bloqueando funcionalidade no portal
- **Prazo Esperado**: O quanto antes

---

**Data do Documento**: 30/01/2025  
**Versão**: 1.0  
**Status**: Aguardando Implementação