import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PaginationBar({
  page,
  totalPages,
  limit,
  onPrev,
  onNext,
  onLimitChange,
  isFetching,
  limitOptions = [10, 12, 20, 50],
}: {
  page: number
  totalPages: number
  limit: number
  onPrev: () => void
  onNext: () => void
  onLimitChange: (n: number) => void
  isFetching?: boolean
  limitOptions?: number[]
}) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div> Página {page} de {totalPages || 1} {isFetching && '(atualizando...)'}</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page<=1} onClick={onPrev}>Anterior</Button>
        <Select value={String(limit)} onValueChange={(v)=> onLimitChange(Number(v))}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {limitOptions.map(n => (<SelectItem key={n} value={String(n)}>{n}/pág</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" disabled={page>= (totalPages||1)} onClick={onNext}>Próxima</Button>
      </div>
    </div>
  )
}

