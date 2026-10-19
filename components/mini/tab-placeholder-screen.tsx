import Image from 'next/image'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { tabs, type TabKey } from '@/components/mini/tab-bar'

export function TabPlaceholderScreen({ tab }: { tab: Exclude<TabKey, 'home'> }) {
  const { label, icon } = tabs.find((t) => t.key === tab)!
  return (
    <div className="flex h-full flex-col bg-background">
      <StatusBar />
      <header className="relative flex h-11 shrink-0 items-center justify-center">
        <h1 className="text-heading font-semibold text-foreground">{label}</h1>
        <Capsule className="absolute right-3" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_#3a82e414]">
          <Image src={icon} alt="" width={40} height={40} className="size-10 object-contain mix-blend-multiply" />
        </span>
        <p className="text-body font-medium text-foreground">{label}页面待设计</p>
        <p className="text-caption text-muted-foreground">右下角 AI 入口在任意页面均可唤起</p>
      </div>
    </div>
  )
}
