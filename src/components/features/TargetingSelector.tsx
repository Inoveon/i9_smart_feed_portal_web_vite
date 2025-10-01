import { useMemo, useState } from 'react'
import { useBranchRegions } from '@/services/branches.service'
import { useStationsAvailable } from '@/services/stations.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type TargetingMode = 'global' | 'regions' | 'branches' | 'stations'

export interface TargetingValue {
  mode: TargetingMode
  regions: string[]
  branches: string[]
  stations: string[]
}

export function TargetingSelector({ value, onChange }: {
  value: TargetingValue
  onChange: (next: TargetingValue) => void
}) {
  const { data: regionsData, isLoading: regionsLoading } = useBranchRegions()
  const { data: available, isLoading: stationsLoading } = useStationsAvailable()
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [branchFilter, setBranchFilter] = useState<string>('')

  const allRegions = regionsData?.regions || []

  const branchEntries = useMemo(() => {
    if (!available?.branches) return []
    const keys = Object.keys(available.branches)
    return keys
      .filter(code => (regionFilter ? available.branches[code].region === regionFilter : true))
      .map(code => ({ code, name: available.branches[code].name, region: available.branches[code].region, state: available.branches[code].state }))
  }, [available, regionFilter])

  const stationsByBranch = useMemo(() => available?.branches || {}, [available])

  // Verifica se está carregando dados essenciais
  const isLoading = regionsLoading || stationsLoading
  const hasNoData = !regionsData || !available

  const handleModeChange = (mode: TargetingMode) => {
    if (mode === 'global') {
      onChange({ mode, regions: [], branches: [], stations: [] })
    } else {
      onChange({ ...value, mode })
    }
  }

  const toggleArrayItem = (arr: string[], item: string) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alcance (Targeting)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mensagem de carregamento ou erro */}
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Carregando dados de regiões e filiais...
          </div>
        )}
        
        {!isLoading && hasNoData && (
          <div className="text-sm text-destructive">
            Erro ao carregar dados de targeting. Verifique a conexão com a API.
          </div>
        )}
        
        {/* Modo de Targeting */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { key: 'global', label: 'Global', disabled: false },
            { key: 'regions', label: 'Regiões', disabled: hasNoData || allRegions.length === 0 },
            { key: 'branches', label: 'Filiais', disabled: hasNoData || !available?.branches },
            { key: 'stations', label: 'Estações', disabled: hasNoData || !available?.branches },
          ] as { key: TargetingMode; label: string; disabled: boolean }[]).map(opt => (
            <label 
              key={opt.key} 
              className={`border rounded-md p-2 ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${value.mode === opt.key ? 'border-primary' : 'border-border'}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="targeting-mode"
                  checked={value.mode === opt.key}
                  onChange={() => !opt.disabled && handleModeChange(opt.key)}
                  disabled={opt.disabled}
                />
                <span>{opt.label}</span>
                {opt.disabled && opt.key !== 'global' && (
                  <span className="text-xs text-muted-foreground ml-1">(sem dados)</span>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Resumo + Limpar */}
        <div className="flex items-center flex-wrap gap-2">
          {value.mode === 'global' && <Badge variant="outline">Global</Badge>}
          {value.regions.map(r => <Badge key={r} variant="outline">Região: {r}</Badge>)}
          {value.branches.map(b => <Badge key={b} variant="outline">Filial: {b}</Badge>)}
          {value.stations.map(s => <Badge key={s} variant="outline">Estação: {s}</Badge>)}
          {(value.regions.length + value.branches.length + value.stations.length) > 0 && (
            <Button variant="outline" size="sm" onClick={() => onChange({ mode: 'global', regions: [], branches: [], stations: [] })}>
              Limpar tudo
            </Button>
          )}
        </div>

        {/* Regiões */}
        {value.mode === 'regions' && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Selecione uma ou mais regiões</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {allRegions.map(r => (
                <label key={r} className="flex items-center gap-2 border rounded-md p-2">
                  <Checkbox
                    checked={value.regions.includes(r)}
                    onCheckedChange={() => onChange({ ...value, regions: toggleArrayItem(value.regions, r), branches: [], stations: [] })}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filiais */}
        {value.mode === 'branches' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <div className="text-xs mb-1 text-muted-foreground">Filtrar por região</div>
                <Select onValueChange={(v) => setRegionFilter(v === 'all' ? '' : v)} value={regionFilter || 'all'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as regiões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {allRegions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-auto pr-1">
              {branchEntries.map(b => (
                <label key={b.code} className="flex items-center gap-2 border rounded-md p-2">
                  <Checkbox
                    checked={value.branches.includes(b.code)}
                    onCheckedChange={() => onChange({ ...value, branches: toggleArrayItem(value.branches, b.code), regions: [], stations: [] })}
                  />
                  <span>{b.name} ({b.code})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Estações */}
        {value.mode === 'stations' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <div className="text-xs mb-1 text-muted-foreground">Filtrar por filial</div>
                <Select onValueChange={(v) => setBranchFilter(v === 'all' ? '' : v)} value={branchFilter || 'all'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as filiais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.keys(stationsByBranch).map(code => (
                      <SelectItem key={code} value={code}>{code} — {stationsByBranch[code].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-auto pr-1">
              {Object.keys(stationsByBranch)
                .filter(code => (branchFilter ? code === branchFilter : true))
                .map(code => (
                  <div key={code} className="border rounded-md">
                    <div className="px-3 py-2 text-sm font-medium bg-muted">{stationsByBranch[code].name} ({code})</div>
                    <div className="p-2 space-y-1">
                      {stationsByBranch[code].stations.map(s => (
                        <label key={`${code}:${s.code}`} className="flex items-center gap-2 p-1 rounded">
                          <Checkbox
                            checked={value.stations.includes(s.code)}
                            onCheckedChange={() => onChange({
                              ...value,
                              // API espera apenas station codes, desambiguadas pelos branches selecionados
                              stations: toggleArrayItem(value.stations, s.code),
                              regions: [],
                              // garantir branch selecionada ao escolher estação
                              branches: value.branches.includes(code) ? value.branches : [...value.branches, code]
                            })}
                          />
                          <span>{s.code} — {s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Contadores */}
        <div className="text-sm text-muted-foreground">
          {value.mode === 'global' && 'Campanha Global — todas as estações'}
          {value.mode === 'regions' && `Regiões selecionadas: ${value.regions.length}`}
          {value.mode === 'branches' && `Filiais selecionadas: ${value.branches.length}`}
          {value.mode === 'stations' && `Estações selecionadas: ${value.stations.length}`}
        </div>
      </CardContent>
    </Card>
  )
}
