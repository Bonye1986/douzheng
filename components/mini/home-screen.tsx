'use client'

import { ChevronRight, Circle, Ellipsis, MessageCircleQuestion, Sparkles } from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import { BrandMark } from '@/components/mini/auth-parts'
import { TabBar } from '@/components/mini/tab-bar'
import { presetQuestions } from '@/components/mini/home-data'

export function HomeScreen({ onOpenChat }: { onOpenChat?: (question?: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#e6f1fe_0%,#f4f8fe_45%)]">
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center justify-end px-3">
        <div
          aria-hidden="true"
          className="flex h-8 items-center gap-3 rounded-full border border-border bg-white/80 px-3 text-foreground"
        >
          <Ellipsis className="size-4" />
          <span className="h-4 w-px bg-border" />
          <Circle className="size-3.5" strokeWidth={3} />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-4 [scrollbar-width:none]">
        <section className="flex flex-col items-center pt-8 text-center">
          <BrandMark size="lg" />
          <h1 className="mt-4 text-[22px] font-bold text-foreground">药问基因</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">都正生物 · AI 用药基因助手</p>
        </section>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="mt-8 flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-white pl-4 pr-2 text-left shadow-[0_8px_24px_#3b8beb1a] transition-transform active:scale-[0.99]"
        >
          <Sparkles className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-[15px] text-[#a3adc2]">输入您的用药或基因问题</span>
          <span className="flex h-10 shrink-0 items-center rounded-xl bg-primary px-4 text-[14px] font-medium text-white">
            提问
          </span>
        </button>

        <section aria-labelledby="hot-q" className="mt-8">
          <h2 id="hot-q" className="mb-3 flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
            <MessageCircleQuestion className="size-4 text-primary" />
            大家都在问
          </h2>
          <ul className="flex flex-col gap-2">
            {presetQuestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-left transition-colors active:bg-white"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{item.question}</span>
                  <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <TabBar active="home" />
    </div>
  )
}
