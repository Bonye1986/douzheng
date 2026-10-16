import { Sparkles } from 'lucide-react'

export function FloatingAiButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="打开 AI 咨询"
      className="absolute bottom-[92px] right-3 z-20 flex size-11 items-center justify-center rounded-full bg-brand-strong text-white shadow-[0_6px_14px_#3b8beb40] ring-2 ring-white/90 transition-transform active:scale-95"
    >
      <Sparkles className="size-[18px]" strokeWidth={2.2} />
    </button>
  )
}
