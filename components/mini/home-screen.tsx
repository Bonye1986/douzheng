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
  HeartPulse,
  PackageCheck,
  PackageSearch,
  Pill,
  RefreshCw,
  Sparkles,
  TestTube,
  Truck,
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
const quickActions = [
  { id: 'report', icon: FileText, label: '查报告', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, label: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, label: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, label: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
  { id: 'order', icon: Truck, label: '订单进度', question: '帮我查一下我的订单进度' },
  { id: 'sampling', icon: TestTube, label: '采样指引', question: '口腔拭子应该怎么正确采样？' },
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
  <section className="flex items-center justify-between gap-2 pt-4">
  <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
            <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
            <p className="text-balance text-[24px] font-semibold leading-tight text-foreground">
              Hi，我是您的
              <br />
              <span className="text-primary">精准用药助手</span>
            </p>
            <p className="mt-2 text-pretty text-caption leading-relaxed text-muted-foreground">
              用药疑问、基因检测、
              <br />
              报告解读，随时问我
            </p>
          </div>
          <div
            aria-hidden="true"
            className="relative h-[168px] w-[136px] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
          >
            <Image
              src="/images/ai-assistant-mascot.png"
              alt=""
              fill
              sizes="136px"
              priority
              className="object-contain object-top"
            />
          </div>
        </section>

        <nav
          aria-label="快捷功能"
          className="-mx-5 mt-10 shrink-0 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-28px),transparent)]"
        >
          <ul className="flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickActions.map(({ id, icon: Icon, label, question }) => (
              <li key={id} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => onOpenChat?.(question)}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-white bg-white/80 pl-1.5 pr-3.5 text-caption font-medium text-foreground shadow-[0_2px_8px_#3a82e40f] backdrop-blur transition-transform active:scale-[0.96]"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="mt-2.5 flex h-12 w-full shrink-0 items-center gap-3 rounded-full border border-border bg-white px-4 text-left shadow-[0_8px_24px_#3a82e41a] transition-transform active:scale-[0.99]"
        >
          <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-body text-faint">有问题，尽管问我</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowUp className="size-4" aria-hidden="true" />
          </span>
        </button>

        <section
          aria-labelledby="guess-q"
          className="mt-5 rounded-[28px] border border-white bg-white/50 p-3 shadow-[0_8px_28px_#3a82e414]"
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

          <ul key={page} className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
            {visibleSuggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex h-11 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-[0_2px_10px_#3a82e40d] transition-transform active:scale-[0.99]"
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
      </div>
    </div>
  )
}
