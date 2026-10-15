import { Sparkles } from 'lucide-react'

export function FloatingAiButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="打开 AI 咨询"
      className="absolute bottom-[96px] right-4 z-20 flex size-14 flex-col items-center justify-center gap-0.5 rounded-full bg-[linear-gradient(135deg,#5aa2f5_0%,#3b8beb_100%)] text-white shadow-[0_10px_24px_#3b8beb59] ring-4 ring-white transition-transform active:scale-95"
    >
      <Sparkles className="size-5" />
      <span className="text-[10px] font-semibold leading-none">AI</span>
    </button>
  )
}
