import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

type PrimaryAction = {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  to?: string
  onClick?: () => void
}

export function PageHeader({ title, description, primaryAction }: {
  title: string
  description?: string
  primaryAction?: PrimaryAction
}) {
  const ActionIcon = primaryAction?.icon
  const content = (
    <Button onClick={primaryAction?.onClick}>
      {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />} {primaryAction?.label}
    </Button>
  )

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {primaryAction && (primaryAction.to ? (
        <Button asChild>
          <Link to={primaryAction.to}>
            {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />} {primaryAction.label}
          </Link>
        </Button>
      ) : content)}
    </div>
  )
}
