import { ClipboardList, FlaskConical, House, MessageCircle, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'home', label: '首页', icon: House },
  { key: 'service', label: '检测服务', icon: FlaskConical },
  { key: 'order', label: '订单', icon: ClipboardList },
  { key: 'message', label: '消息', icon: MessageCircle, badge: 2 },
  { key: 'me', label: '我的', icon: UserRound },
]

export function TabBar({ active = 'home' }: { active?: string }) {
  return (
    <nav aria-label="底部导航" className="shrink-0 border-t border-border bg-white pb-5">
      <ul className="flex h-[54px] items-center">
        {tabs.map(({ key, label, icon: Icon, badge }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <a
                href="#"
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 text-[10px]',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  {badge ? (
                    <span className="absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-[#f06a6a] text-[9px] font-semibold text-white">
                      {badge}
                      <span className="sr-only">条未读</span>
                    </span>
                  ) : null}
                </span>
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
