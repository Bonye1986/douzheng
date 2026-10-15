import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { tabs, type TabKey } from '@/components/mini/tab-bar'

export function TabPlaceholderScreen({ tab }: { tab: Exclude<TabKey, 'home'> }) {
  const { label, icon: Icon } = tabs.find((t) => t.key === tab)!
  return (
    <div className="flex h-full flex-col bg-[#f4f8fe]">
      <StatusBar />
      <header className="relative flex h-11 shrink-0 items-center justify-center">
        <h1 className="text-[17px] font-semibold text-foreground">{label}</h1>
        <Capsule className="absolute right-3" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_8px_24px_#3b8beb14]">
          <Icon className="size-7" />
        </span>
        <p className="text-[14px] font-medium text-foreground">{label}页面待设计</p>
        <p className="text-[12px] text-muted-foreground">右下角 AI 入口在任意页面均可唤起</p>
      </div>
    </div>
  )
}
