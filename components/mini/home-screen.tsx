'use client'

import { ChevronRight, Circle, Ellipsis, Sparkles } from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import Image from 'next/image'
import { presetQuestions } from '@/components/mini/home-data'
import { SectionHeading } from '@/components/mini/section-heading'

export function HomeScreen({ onOpenChat }: { onOpenChat?: (question?: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-brand-page">
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
        <section className="flex flex-col items-center pt-10 text-center">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <Image
            src="/images/drugene-logo.png"
            alt="DRUGENE 临床精准用药助手"
            width={436}
            height={147}
            priority
            className="h-auto w-[220px]"
          />
        </section>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="mt-8 flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 text-left shadow-[0_8px_24px_#3a82e41a] transition-transform active:scale-[0.99]"
        >
          <Sparkles className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-title text-faint">输入您的用药或基因问题</span>
        </button>

        <section aria-labelledby="hot-q" className="mt-8">
          <SectionHeading id="hot-q" title="大家都在问" className="mb-3" />
          <ul className="grid grid-cols-2 gap-2.5">
            {presetQuestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex h-full min-h-[76px] w-full flex-col justify-between gap-2 rounded-2xl border border-border/60 bg-white p-3 text-left shadow-[0_2px_10px_#3a82e40d] transition-colors active:bg-brand-page"
                >
                  <span className="line-clamp-2 text-body font-medium leading-snug text-foreground">
                    {item.question}
                  </span>
                  <span className="flex items-center gap-0.5 text-caption text-primary">
                    问问 AI
                    <ChevronRight className="size-3" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
