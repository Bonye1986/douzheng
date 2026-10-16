import Image from 'next/image'
import { cn } from '@/lib/utils'

export const tabs = [
  { key: 'home', label: '首页', icon: '/images/icons/tab-home.png' },
  { key: 'service', label: '服务', icon: '/images/icons/tab-service.png' },
  { key: 'test', label: '检测', icon: '/images/icons/tab-test.png' },
  { key: 'me', label: '我的', icon: '/images/icons/tab-me.png' },
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
        {tabs.map(({ key, label, icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect?.(key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-0.5 text-[10px]',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )}
              >
                <Image
                  src={icon}
                  alt=""
                  width={24}
                  height={24}
                  className={cn(
                    'size-6 object-contain mix-blend-multiply transition',
                    !isActive && 'opacity-45 grayscale',
                  )}
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
