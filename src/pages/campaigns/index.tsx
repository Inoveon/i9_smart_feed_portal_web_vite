import { useMemo, useState } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { DataTableShell } from '@/components/features/table/DataTableShell'
import { PaginationBar } from '@/components/features/table/PaginationBar'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { useCampaignsList, useDeleteCampaign } from '@/services/campaigns.service'
import { useStationsAvailable } from '@/services/stations.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { translateCampaignStatus } from '@/lib/utils'

export function CampaignsPage() {
  // Server-side pagination params
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const deleteMetadata = useDeleteCampaign()
  const { data: available } = useStationsAvailable()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [region, setRegion] = useState('')

  // Extrair lista única de regiões
  const regions = useMemo(() => {
    if (!available?.branches) return []
    const set = new Set<string>()
    Object.values(available.branches).forEach(branch => {
      if (branch.region) set.add(branch.region)
    })
    return Array.from(set).sort()
  }, [available])

  const { data, isLoading, error, refetch, isFetching } = useCampaignsList({
    page,
    limit,
    search,
    status: status || undefined,
    // region filter pode ser aplicado se a API suportar
  })
  const totalPages = data ? data.total_pages : 1
  const items = data ? data.items : []

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir a campanha "${name}"?`)) return
    try {
      await deleteMetadata.mutateAsync(id)
      toast.success('Campanha excluída com sucesso')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao excluir campanha')
    }
  }

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'scheduled': return 'secondary'
      case 'paused': return 'outline'
      case 'expired': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Campanhas"
          description="Gerencie suas campanhas de marketing digital"
          primaryAction={{ label: 'Nova Campanha', icon: Plus, to: '/campaigns/new' }}
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
                  placeholder="Buscar campanhas..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="scheduled">Agendadas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={region || 'all'} onValueChange={(v) => { setRegion(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
                      <th className="py-2 pr-4">Nome</th>
                      <th className="py-2 pr-4">Descrição</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Prioridade</th>
                      <th className="py-2 pr-4">Período</th>
                      <th className="py-2 pr-4">Targeting</th>
                      <th className="py-2 pr-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-muted/40">
                        <td className="py-2 pr-4 font-medium">{campaign.name}</td>
                        <td className="py-2 pr-4 max-w-xs truncate">{campaign.description || '-'}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={getStatusBadgeVariant(campaign.status || 'active')}>
                            {translateCampaignStatus(campaign.status || 'active')}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">{campaign.priority}</td>
                        <td className="py-2 pr-4 text-xs">
                          {campaign.start_date && campaign.end_date ? (
                            <>
                              {new Date(campaign.start_date).toLocaleDateString('pt-BR')}
                              <br />
                              <span className="text-muted-foreground">
                                até {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          ) : '-'}
                        </td>
                        <td className="py-2 pr-4">
                          {(() => {
                            const regions = (campaign as any).regions as string[] | undefined
                            const branches = (campaign as any).branches as string[] | undefined
                            const stations = campaign.stations
                            if ((regions?.length || 0) === 0 && (branches?.length || 0) === 0 && (stations?.length || 0) === 0) {
                              return <span className="text-muted-foreground">Global</span>
                            }
                            const parts: string[] = []
                            if (regions?.length) parts.push(`R: ${regions.length}`)
                            if (branches?.length) parts.push(`F: ${branches.length}`)
                            if (stations?.length) parts.push(`E: ${stations.length}`)
                            return <span className="text-xs">{parts.join(' · ')}</span>
                          })()}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="icon" variant="ghost" title="Gerenciar imagens">
                              <Link to={`/campaigns/${campaign.id}/images`}>
                                <ImageIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild size="icon" variant="ghost" title="Editar">
                              <Link to={`/campaigns/${campaign.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" title="Excluir" onClick={() => handleDelete(campaign.id, campaign.name)}>
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

export default CampaignsPage