# 📋 Solicitações de Implementação Backend

Este documento registra funcionalidades que foram implementadas no frontend mas aguardam implementação no backend.

## 🖼️ Sistema de Imagens para Campanhas

**Status:** ⏳ Aguardando implementação no backend

### Funcionalidades Implementadas no Frontend

#### 1. Interface de Upload
- ✅ Componente `ImageUploader` completo
- ✅ Suporte a drag & drop
- ✅ Validação de formato (JPG, PNG, WEBP)
- ✅ Validação de tamanho (máx 10MB)
- ✅ Upload múltiplo (até 20 arquivos)
- ✅ Preview antes do upload
- ✅ Progress tracking
- ✅ Error handling

#### 2. Galeria de Imagens
- ✅ Componente `ImageGallery` completo
- ✅ Grid responsivo
- ✅ Modal de visualização
- ✅ Informações detalhadas (tamanho, dimensões, tipo)
- ✅ Reordenação por drag & drop
- ✅ Exclusão com confirmação

#### 3. Página Dedicada
- ✅ Rota `/campaigns/:id/images`
- ✅ Interface completa de gerenciamento
- ✅ Integração com lista de campanhas

#### 4. Service Layer
- ✅ Métodos `uploadImages()`, `reorderImages()`, `deleteImage()`
- ✅ Hooks React Query: `useUploadImages`, `useReorderImages`, `useDeleteImage`
- ✅ Types TypeScript completos
- ✅ Validação com Zod schemas

### Endpoints Backend Necessários

Conforme documentado em `docs/API-DOCUMENTATION.md`:

```typescript
// 1. Upload de imagens
POST /api/campaigns/{id}/images
Content-Type: multipart/form-data
Body: files[] (File[])
Response: CampaignImage[]

// 2. Reordenar imagens
PUT /api/campaigns/{id}/images/order
Content-Type: application/json
Body: string[] (array de image IDs)
Response: void

// 3. Deletar imagem
DELETE /api/images/{id}
Response: void

// 4. Listar imagens (já incluso em GET /api/campaigns/{id})
// Campo images?: CampaignImage[] no modelo Campaign
```

### Modelo de Dados (já documentado)

```typescript
interface CampaignImage {
  id: string;                    // UUID
  campaign_id: string;           // UUID da campanha
  filename: string;              // Nome do arquivo no storage
  original_filename?: string;    // Nome original do upload
  url: string;                   // URL completa da imagem
  order: number;                 // Ordem de exibição (0, 1, 2...)
  display_time?: number;         // Override do tempo (ms)
  title?: string;                // Título opcional
  description?: string;          // Descrição opcional
  active: boolean;               // Se está ativa
  size_bytes?: number;           // Tamanho em bytes
  mime_type?: string;            // image/jpeg, image/png
  width?: number;                // Largura em pixels
  height?: number;               // Altura em pixels
  created_at: DateTime;
  updated_at: DateTime;
}
```

### Regras de Negócio Implementadas

- ✅ Formatos aceitos: JPG, JPEG, PNG, WEBP
- ✅ Tamanho máximo: 10MB por arquivo
- ✅ Upload múltiplo: Até 20 imagens por requisição
- ✅ Ordenação: Sequencial sem gaps (0, 1, 2, 3...)
- ✅ Display time: 1000ms-60000ms, padrão 5000ms
- ✅ Validação de tipos MIME
- ✅ Preview com cleanup de URLs

### Status Atual

**Frontend:** 100% completo e funcional
**Backend:** Endpoints retornam 404
**Integração:** Aguardando implementação dos endpoints

### Mensagens para Usuário

O frontend já exibe mensagens apropriadas:

```
⚠️ Funcionalidade em desenvolvimento: O upload de imagens estará 
disponível em breve. Esta interface está pronta mas aguarda 
implementação no backend.
```

### Próximos Passos

1. **Backend Team**: Implementar endpoints conforme documentação
2. **Storage**: Configurar MinIO/S3 bucket para imagens
3. **Processamento**: Implementar resize/otimização automática
4. **CDN**: Configurar URLs públicas para imagens
5. **Testing**: Testes de upload e performance

### Testes Realizados

**Endpoints testados em 24/09/2025:**
- ❌ `GET /api/images` - Status: 404
- ❌ `GET /api/campaigns/{id}/images` - Status: 404  
- ❌ `POST /api/campaigns/{id}/images` - Status: 404
- ❌ `DELETE /api/images/{id}` - Status: 404
- ❌ `PUT /api/campaigns/{id}/images/order` - Status: 404

**API Base funcionando:**
- ✅ `POST /api/auth/login` - Status: 200
- ✅ `GET /api/campaigns` - Status: 200
- ✅ `GET /api/campaigns/{id}` - Status: 200

---

*Documento atualizado em: 24/09/2025*
*Por: Agente A06-IMAGES-MANAGEMENT*