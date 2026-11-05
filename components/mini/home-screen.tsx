'use client'

import { useState } from 'react'
import { ArrowUp, ChevronRight, Circle, Ellipsis, RefreshCw, Sparkles } from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import Image from 'next/image'
import { presetQuestions } from '@/components/mini/home-data'

const PAGE_SIZE = 3
const pageCount = Math.ceil(presetQuestions.length / PAGE_SIZE)
const categories = Array.from(new Set(presetQuestions.map((q) => q.category)))

export function HomeScreen({ onOpenChat }: { onOpenChat?: (question?: string) => void }) {
  const [page, setPage] = useState(0)
  const visible = presetQuestions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
        <section className="flex flex-col items-start pt-6">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <Image
            src="/images/drugene-logo.png"
            alt="DRUGENE 临床精准用药助手"
            width={436}
            height={147}
            priority
            className="h-auto w-[120px]"
          />
          <p className="mt-5 text-balance text-[26px] font-semibold leading-tight text-foreground">
            Hi，我是您的
            <br />
            <span className="text-primary">精准用药助手</span>
          </p>
          <p className="mt-2 text-caption leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，随时问我
          </p>
        </section>

        <section aria-labelledby="guess-q" className="mt-7 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 id="guess-q" className="text-caption font-medium text-muted-foreground">
              你可以这样问我
            </h2>
            {pageCount > 1 && (
              <button
                type="button"
                onClick={() => setPage((p) => (p + 1) % pageCount)}
                className="flex h-7 items-center gap-1 rounded-full px-2 text-caption text-muted-foreground active:bg-white"
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                换一换
              </button>
            )}
          </div>

          <ul className="mt-2.5 flex flex-col items-start gap-2.5">
            {visible.map((item) => (
              <li key={item.id} className="max-w-full">
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex max-w-full items-center gap-2 rounded-2xl rounded-tl-md bg-white py-2.5 pl-3 pr-2.5 text-left shadow-[0_4px_16px_#3a82e412] transition-transform active:scale-[0.98]"
                >
                  <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    {item.category}
                  </span>
                  <span className="min-w-0 truncate text-body text-foreground">{item.question}</span>
                  <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="shrink-0 px-4 pb-5 pt-2">
        <ul
          aria-label="快捷提问"
          className="-mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          {categories.map((category) => {
            const question = presetQuestions.find((q) => q.category === category)?.question
            return (
              <li key={category} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenChat?.(question)}
                  className="h-8 rounded-full bg-white px-3 text-caption text-foreground shadow-[0_2px_8px_#3a82e40f]"
                >
                  {category}
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="flex h-12 w-full items-center gap-3 rounded-full border border-border bg-white px-4 text-left shadow-[0_8px_24px_#3a82e41a] transition-transform active:scale-[0.99]"
        >
          <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-body text-faint">有问题，尽管问我</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowUp className="size-4" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  )
}
