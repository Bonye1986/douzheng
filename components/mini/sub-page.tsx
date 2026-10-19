import { ChevronLeft } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'

type Props = {
  title: string
  titleId: string
  onBack: () => void
  children: React.ReactNode
}

export function SubPage({ title, titleId, onBack, children }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute inset-0 z-30 flex flex-col bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
    >
      <div className="shrink-0 border-b border-border/70 bg-white">
        <StatusBar />
        <div className="relative flex h-11 items-center justify-center px-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="absolute left-2 flex size-9 items-center justify-center rounded-full text-foreground"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <h1 id={titleId} className="text-[17px] font-semibold text-foreground">
            {title}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>
      {children}
    </div>
  )
}
