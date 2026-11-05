'use client'

import { useState } from 'react'
import { ChevronRight, Circle, Ellipsis, RefreshCw, Sparkles } from 'lucide-react'
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
        <section className="flex flex-col items-center pt-8 text-center">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <Image
            src="/images/drugene-logo.png"
            alt="DRUGENE 临床精准用药助手"
            width={436}
            height={147}
            priority
            className="h-auto w-[200px]"
          />
        </section>

        <section
          aria-labelledby="guess-q"
          className="mt-8 rounded-3xl rounded-tl-md bg-white p-4 shadow-[0_8px_24px_#3a82e414]"
        >
          <p className="text-title font-semibold text-foreground">Hi，我是您的精准用药助手</p>
          <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，都可以问我
          </p>

          <div className="mt-4 flex items-center justify-between">
            <h2 id="guess-q" className="text-caption font-medium text-muted-foreground">
              猜你想问
            </h2>
            {pageCount > 1 && (
              <button
                type="button"
                onClick={() => setPage((p) => (p + 1) % pageCount)}
                className="flex items-center gap-1 text-caption text-primary"
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                换一换
              </button>
            )}
          </div>

          <ul className="mt-1 flex flex-col">
            {visible.map((item) => (
              <li key={item.id} className="border-b border-border/50 last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex h-11 w-full items-center gap-2 text-left"
                >
                  <span className="min-w-0 flex-1 truncate text-body text-foreground">{item.question}</span>
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
          <span className="min-w-0 flex-1 truncate text-body text-faint">输入您的用药或基因问题</span>
        </button>
      </div>
    </div>
  )
}
