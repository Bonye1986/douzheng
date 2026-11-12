'use client'

import {
  ArrowUp,
  ChevronRight,
  Circle,
  Ellipsis,
  FileText,
  HeartPulse,
  PackageSearch,
  Pill,
  Sparkles,
} from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import Image from 'next/image'

const personalizedSuggestions = [
  { id: 'q1', question: '孩子生病，成人药掰开减半喂，可以吗？' },
  { id: 'q2', question: '症状好转就能停药吗？吃药没效果，能自行加量吗？' },
  { id: 'q3', question: '减肥针听说副作用不少，普通人适合打吗？' },
  { id: 'q4', question: '同样的药别人吃效果好，我却副作用大，是什么原因？' },
  { id: 'q5', question: '每天多杯咖啡，需要额外补钙吗？' },
]
const quickActions = [
  { id: 'report', icon: FileText, label: '查报告', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, label: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, label: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, label: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
]

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
  <section className="flex items-center justify-between gap-2 pt-4">
  <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
            <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
            <p className="text-balance text-[24px] font-semibold leading-tight text-foreground">
              Hi，我是您的
              <br />
              <span className="text-primary">用药助手</span>
            </p>
            <p className="mt-2 text-pretty text-caption leading-relaxed text-muted-foreground">
              用药疑问、基因检测、报告解读，随时问我
            </p>
          </div>
          <div
            aria-hidden="true"
            className="relative flex h-[128px] w-[84px] shrink-0 items-end justify-center"
          >
            <span className="absolute bottom-1.5 left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-[50%] bg-[#1e3a8a]/15 blur-[5px]" />
            <div className="relative h-[120px] w-[76px] animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
              <Image
                src="/images/drugene-robot.png"
                alt=""
                fill
                sizes="76px"
                priority
                className="object-contain object-bottom drop-shadow-[0_8px_10px_rgba(30,58,138,0.18)]"
              />
            </div>
          </div>
        </section>

        <nav aria-label="快捷功能" className="mt-10 shrink-0">
          <ul className="grid grid-cols-4 gap-2">
            {quickActions.map(({ id, icon: Icon, label, question }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(question)}
                  className="flex h-14 w-full flex-col items-center justify-center gap-1 rounded-[14px] border border-border/70 bg-white text-[12px] font-medium leading-4 text-foreground transition-colors active:bg-primary/5"
                >
                  <Icon className="size-[18px] shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="mt-2 flex h-[104px] w-full shrink-0 flex-col justify-between rounded-[26px] border-2 border-primary/25 bg-white p-4 text-left shadow-[0_12px_32px_#3a82e426] transition-transform active:scale-[0.99]"
        >
          <span className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-[16px] leading-6 text-faint">有问题，尽管问我～</span>
          </span>
          <span className="flex items-center justify-between">
            <span className="text-caption text-faint">支持文字、语音、图片提问</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_12px_#3a82e459]">
              <ArrowUp className="size-[18px]" aria-hidden="true" />
            </span>
          </span>
        </button>

        <section aria-labelledby="guess-q" className="mt-6 px-1">
          <h2 id="guess-q" className="pb-1 text-[12px] font-medium text-faint">
            猜你想问
          </h2>
          <ul className="flex flex-col">
            {personalizedSuggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(item.question)}
                  className="flex w-full items-center gap-2 py-1.5 text-left transition-opacity active:opacity-60"
                >
                  <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-primary/60" />
                  <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-muted-foreground">
                    {item.question}
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
