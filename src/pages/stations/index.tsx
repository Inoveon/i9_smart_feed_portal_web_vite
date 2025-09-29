import { useMemo, useState } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { DataTableShell } from '@/components/features/table/DataTableShell'
import { PaginationBar } from '@/components/features/table/PaginationBar'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { useStationsList, useDeleteStation, useStationsAvailable } from '@/services/stations.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

export function StationsPage() {
  // Server-side pagination params
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const deleteStation = useDeleteStation()
  const { data: available } = useStationsAvailable()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [stateUF, setStateUF] = useState('')
  const [branchCode, setBranchCode] = useState('')

  // Extrair lista única de regiões dos branches disponíveis
  const regions = useMemo(() => {
    if (!available?.branches) return []
    const set = new Set<string>()
    Object.values(available.branches).forEach(branch => {
      if (branch.region) set.add(branch.region)
    })
    return Array.from(set).sort()
  }, [available])

  // Extrair lista única de estados
  const states = useMemo(() => {
    if (!available?.branches) return []
    const set = new Set<string>()
    Object.values(available.branches).forEach(branch => {
      if (branch.state) set.add(branch.state)
    })
    return Array.from(set).sort()
  }, [available])

  const branchList = useMemo(() => {
    if (!available?.branches) return []
    return Object.keys(available.branches).map(code => ({ 
      code, 
      name: available.branches[code].name,
      region: available.branches[code].region 
    }))
  }, [available])

  const { data, isLoading, error, refetch, isFetching } = useStationsList({
    page,
    limit,
    search,
    branch_code: branchCode || undefined,
    state: stateUF || undefined,
  })
  const totalPages = data ? data.total_pages : 1
  const items = data ? data.items : []

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Desativar a estação "${name}"?`)) return
    try {
      await deleteStation.mutateAsync(id)
      toast.success('Estação desativada com sucesso')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao desativar estação')
    }
  }

  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Estações"
          description="Gerencie as estações cadastradas no sistema"
          primaryAction={{ label: 'Nova Estação', icon: Plus, to: '/stations/new' }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Listagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar no padrão de Campanhas: flex gap-4 com busca e filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estações..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={region || 'all'} onValueChange={(v) => { setRegion(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stateUF || 'all'} onValueChange={(v) => { setStateUF(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Todos os estados" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {states.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={branchCode || 'all'} onValueChange={(v) => { setBranchCode(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Todas as filiais" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {branchList.map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Área de lista com scroll interno e rodapé sticky */}
            <div className="relative max-h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <DataTableShell isLoading={isLoading} error={error as any} itemsLength={items.length} onRetry={()=>refetch()}>
                  <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Código</th>
                      <th className="py-2 pr-4">Nome</th>
                      <th className="py-2 pr-4">Filial</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2 pr-4">Região</th>
                      <th className="py-2 pr-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/40">
                        <td className="py-2 pr-4 font-mono text-xs">{s.code}</td>
                        <td className="py-2 pr-4">{s.name}</td>
                        <td className="py-2 pr-4">{s.branch?.code} — {s.branch?.name}</td>
                        <td className="py-2 pr-4">{s.branch?.state}</td>
                        <td className="py-2 pr-4">{s.branch?.region || '-'}</td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="icon" variant="ghost" title="Editar">
                              <Link to={`/stations/${s.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" title="Desativar" onClick={() => handleDelete(s.id, s.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </DataTableShell>
              </div>
              {/* Rodapé sticky para paginação */}
              <div className="sticky bottom-0 bg-background pt-2">
                <PaginationBar
                  page={page}
                  totalPages={totalPages || 1}
                  limit={limit}
                  onPrev={()=>setPage(p => Math.max(1, p-1))}
                  onNext={()=>setPage(p => p+1)}
                  onLimitChange={(n)=>{ setLimit(n); setPage(1) }}
                  isFetching={isFetching}
                />
              </div>
            </div>

            {/* Erro adicional (redundante) removido – DataTableShell já trata erro */}
          </CardContent>
        </Card>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default StationsPage