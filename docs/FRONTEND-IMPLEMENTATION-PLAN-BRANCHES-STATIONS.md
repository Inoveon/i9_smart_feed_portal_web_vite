# Plano de Implementação Frontend — Branches, Stations e Targeting de Campanhas

## Objetivo
- Implementar no portal administrativo o gerenciamento completo de Filiais (branches), Estações (stations) e o Targeting hierárquico das Campanhas, utilizando exclusivamente os contratos reais expostos pela API.

## Premissas de Contrato (API OK)
- Campaign suporta targeting hierárquico por três eixos, com arrays vazios representando campanha global:
  - regions: string[] (ex.: "Sul", "Sudeste", ...)
  - branches: string[] (códigos de filiais, ex.: "010101")
  - stations: string[] (identificador único de estação; preferencialmente UUID)
- Endpoints disponíveis e estáveis:
  - Branches: CRUD completo + `/api/branches/regions`, `/api/branches/{id}/statistics`
  - Stations: CRUD completo + `/api/stations/available`, `/api/stations/by-branch-and-code/{branch_code}/{station_code}`
  - Campaigns: CRUD completo + `/api/campaigns/active`, `/api/campaigns/active/{station_id}` (inclui globais)

## Serviços e Schemas (Zod + React Query)
- `src/services/branches.service.ts`
  - Métodos: `getAll`, `getActive`, `getById`, `getByCode`, `getRegions`, `getStatistics`, `create`, `update`, `delete`
  - Schemas Zod: `Branch`, `BranchRegions`, `BranchStatistics`
  - Hooks: `useBranches`, `useBranch(id)`, `useBranchRegions()`, `useBranchStatistics(id)`, `useCreateBranch()`, `useUpdateBranch()`, `useDeleteBranch()`
- `src/services/stations.service.ts`
  - Métodos: `getAll`, `getActive`, `getById`, `getByBranch`, `getByBranchAndCode`, `getAvailable`, `create`, `update`, `delete`
  - Schemas Zod: `Station`, `StationAvailable` (estrutura de `regions` e `branches` com suas `stations`)
  - Hooks: `useStations`, `useStation(id)`, `useStationsByBranch(branchId)`, `useStationsAvailable()`, `useCreateStation()`, `useUpdateStation()`, `useDeleteStation()`
- `src/services/campaigns.service.ts` (atualizar)
  - Tipos: incluir `regions?: string[]`, `branches?: string[]`, `stations?: string[]`
  - DTOs de create/update aceitando os três arrays
  - Manter `getActive` e `getActiveByStation` compatíveis

## Páginas e Fluxos
- Filiais (Branches)
  - Listagem: filtros (região, estado, ativo), busca por nome/código, colunas: code, name, city, state, region, is_active, stations_count
  - Detalhe: dados da filial + lista de estações da filial (paginada/filtrável)
  - Formulário: criar/editar/desativar (respeitar roles)
- Estações (Stations)
  - Listagem: filtros por filial (select), estado, ativo; busca por nome/código
  - Formulário: criar/editar/desativar (respeitar roles)
- Campanhas
  - Formulário: nova seção “Alcance (Targeting)”
    - Modos:
      - Global: `regions=[]`, `branches=[]`, `stations=[]`
      - Por Regiões: multi-select de `regions` via `/api/branches/regions`
      - Por Filiais: multi-select de `branches` via `/api/stations/available` (usando `branches` do payload)
      - Por Estações: seleção hierárquica (escolher filiais → estações) via `/api/stations/available`
    - Validações:
      - Global: as três listas vazias
      - Regiões: `regions.length >= 1` e `branches/stations` vazias
      - Filiais: `branches.length >= 1`, `stations` vazia ou coerente com filiais escolhidas
      - Estações: `stations.length >= 1` e coerência com filiais selecionadas (se exigido)
    - UX: contador/resumo de cobertura (filiais/estações), chips, limpar seleção
  - Listagem de Campanhas: exibir resumo de targeting (Global | Regiões N | Filiais N | Estações N) e filtros opcionais

## Dashboard e Métricas
- Cartões: “Estações Conectadas” (metrics), “Filiais Ativas” (branches/active)
- Seção de campanhas ativas: indicar se global/específica

## Permissões (RoleGuard)
- Adicionar permissões para `branches` (create/update/delete) análogo a `stations`
- Condicionar botões/rotas conforme `admin|editor|viewer`

## Estados, Erros e Acessibilidade
- Loaders (Skeleton) em listas/forms
- Tratamento de erros com toasts e mensagens de vazio claras
- Navegação por teclado e rótulos descritivos na seleção hierárquica

## Testes Manuais (Checklist)
- Filiais: listar/filtrar, criar, editar, desativar, detalhar com estações
- Estações: listar por filial, criar, editar, desativar
- Campanhas (os quatro modos): Global, Regiões, Filiais, Estações (salvar/ler e refletir em ativas)
- Ativas por estação: `/api/campaigns/active/{station_id}` e tablets (consistência)

## Fases e Entregáveis
1. Serviços (branches/stations) + atualização de campaigns.service
2. TargetingSelector e integração no form de campanha
3. CRUD de Filiais e Estações + rotas/menus/RoleGuard
4. Ajustes em listagens e Dashboard
5. QA manual e refinamentos

