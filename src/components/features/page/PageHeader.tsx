import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

export type PrimaryAction = {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  to?: string
  onClick?: () => void
}

type BackButton = {
  label: string
  icon?: LucideIcon
  onClick?: () => void | Promise<void>
}

export function PageHeader({ title, description, primaryAction, backButton }: {
  title: string
  description?: string
  primaryAction?: PrimaryAction
  backButton?: BackButton
}) {
  const ActionIcon = primaryAction?.icon
  const content = (
    <Button onClick={primaryAction?.onClick}>
      {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />} {primaryAction?.label}
    </Button>
  )

  const BackIcon = backButton?.icon

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        {backButton && (
          <Button
            variant="outline"
            size="icon"
            onClick={backButton.onClick}
            className="mt-1"
          >
            {BackIcon && <BackIcon className="h-4 w-4" />}
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
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
