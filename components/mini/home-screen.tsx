'use client'

import { useState } from 'react'
import {
  ArrowRight,
  ArrowUp,
  Baby,
  Circle,
  Clock,
  Ellipsis,
  FileText,
  Hash,
  PackageCheck,
  Pill,
  RefreshCw,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import Image from 'next/image'

const PAGE_SIZE = 3

const personalizedSuggestions = [
  { id: 'p1', icon: FileText, reason: '您有 1 份新报告', question: '帮我解读报告里的高风险药物' },
  { id: 'p2', icon: Clock, reason: '订单检测中', question: '我的报告大概什么时候出？' },
  { id: 'p3', icon: Pill, reason: '正在服用 华法林', question: '华法林的剂量需要调整吗？' },
  { id: 'p4', icon: UserRound, reason: '家人 李秀兰 · 58 岁', question: '老人适合做哪项基因检测？' },
  { id: 'p5', icon: PackageCheck, reason: '样本待寄回', question: '采样后多久内需要寄回？' },
  { id: 'p6', icon: Baby, reason: '近期浏览 儿童用药', question: '孩子用药前需要做基因检测吗？' },
]
const suggestionPageCount = Math.ceil(personalizedSuggestions.length / PAGE_SIZE)

export function HomeScreen({ onOpenChat }: { onOpenChat?: (question?: string) => void }) {
  const [page, setPage] = useState(0)
  const visibleSuggestions = personalizedSuggestions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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

        <section
          aria-labelledby="guess-q"
          className="mt-7 rounded-[28px] border border-white bg-white/50 p-3 shadow-[0_8px_28px_#3a82e414]"
        >
          <div className="flex items-center justify-between pb-3 pl-1.5 pt-1">
            <h2 id="guess-q" className="flex items-center gap-2 text-body font-semibold text-foreground">
              <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-primary" />
              猜你想问
            </h2>
            {suggestionPageCount > 1 && (
              <button
                type="button"
                onClick={() => setPage((p) => (p + 1) % suggestionPageCount)}
                className="flex h-7 items-center gap-1 rounded-full bg-white px-3 text-caption text-muted-foreground active:opacity-70"
              >
                换一批
                <RefreshCw className="size-3" aria-hidden="true" />
              </button>
            )}
          </div>

          <ul key={page} className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
            {visibleSuggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-[0_2px_10px_#3a82e40d] transition-transform active:scale-[0.99]"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_4px_10px_#3a82e440]"
                  >
                    <Hash className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-foreground">{item.question}</span>
                  <ArrowRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="mt-5 flex h-12 w-full shrink-0 items-center gap-3 rounded-full border border-border bg-white px-4 text-left shadow-[0_8px_24px_#3a82e41a] transition-transform active:scale-[0.99]"
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
