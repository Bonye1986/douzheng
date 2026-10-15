import { FlaskConical, House, LayoutGrid, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export const tabs = [
  { key: 'home', label: '首页', icon: House },
  { key: 'service', label: '服务', icon: LayoutGrid },
  { key: 'test', label: '检测', icon: FlaskConical },
  { key: 'me', label: '我的', icon: UserRound },
] as const

export type TabKey = (typeof tabs)[number]['key']

export function TabBar({
  active = 'home',
  onSelect,
}: {
  active?: TabKey
  onSelect?: (key: TabKey) => void
}) {
  return (
    <nav aria-label="底部导航" className="shrink-0 border-t border-border bg-white pb-5">
      <ul className="flex h-[54px] items-center">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect?.(key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 text-[10px]',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
