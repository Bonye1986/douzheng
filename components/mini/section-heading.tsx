import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  id,
  title,
  as: Tag = 'h2',
  action,
  onAction,
  className,
}: {
  id: string
  title: string
  as?: 'h2' | 'h3'
  action?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Tag id={id} className="flex items-center gap-2 text-title font-semibold text-foreground">
        <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
        {title}
      </Tag>
      {action && (
        <button
          type="button"
          onClick={onAction}
          aria-label={`${title}：${action}`}
          className="-mr-1 flex items-center gap-0.5 rounded-full px-1 py-0.5 text-caption text-muted-foreground transition-colors active:text-primary"
        >
          {action}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
