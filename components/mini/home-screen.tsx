'use client'

import type { ReactNode } from 'react'
import { ChevronRight, FileText, HeartPulse, PackageSearch, Pill } from 'lucide-react'
import Image from 'next/image'

const personalizedSuggestions = [
  { id: 'q1', question: '孩子生病，成人药掰开减半喂，可以吗？' },
  { id: 'q2', question: '症状好转就能停药吗？吃药没效果，能自行加量吗？' },
  { id: 'q3', question: '减肥针听说副作用不少，普通人适合打吗？' },
  { id: 'q4', question: '同样的药别人吃效果好，我却副作用大，是什么原因？' },
  { id: 'q5', question: '每天多杯咖啡，需要额外补钙吗？' },
]
const quickActions = [
  { id: 'report', icon: FileText, label: '报告查询', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, label: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, label: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, label: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
]

/**
 * 首页即 AI 页：未开始对话时的欢迎区。
 * 版式：助手形象 → 快捷入口 → 大输入卡（语音/拍照/附件/发送）→ 受检人/回答风格 → 猜你想问。
 */
export function HomeWelcome({
  onAsk,
  disabled,
  composer,
  context,
}: {
  onAsk: (question: string) => void
  disabled?: boolean
  /** 大输入卡（ChatComposer card 版） */
  composer: ReactNode
  /** 受检人选择 + 通俗/专业切换 */
  context: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <section className="flex items-center justify-between gap-2 pl-1">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <p className="text-[26px] font-semibold leading-[1.3] tracking-tight text-foreground">
            Hi，我是您的
            <br />
            <span className="text-primary">用药助手</span>
          </p>
          <p className="whitespace-nowrap text-[12.5px] leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，随时问我
          </p>
        </div>
        <div aria-hidden="true" className="relative h-[136px] w-[92px] shrink-0">
          <span className="absolute bottom-0 left-1/2 h-3 w-16 -translate-x-1/2 rounded-[50%] bg-[#1e3a8a]/15 blur-[6px]" />
          <div className="relative size-full animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
            <Image
              src="/images/drugene-robot.png"
              alt=""
              fill
              sizes="92px"
              priority
              className="object-contain object-bottom drop-shadow-[0_8px_10px_rgba(30,58,138,0.18)]"
            />
          </div>
        </div>
      </section>

      <nav aria-label="快捷功能" className="mt-2">
        <ul className="grid grid-cols-4 gap-2">
          {quickActions.map(({ id, icon: Icon, label, question }) => (
            <li key={id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(question)}
                className="flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-white text-[13px] font-medium text-foreground shadow-[0_2px_10px_#3a82e40f] ring-1 ring-[#e6eefb] transition-colors active:bg-secondary/60 disabled:opacity-50"
              >
                <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.9} aria-hidden="true" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-2">
        {composer}
        {context}
      </div>

      <section aria-labelledby="guess-q" className="mt-1 flex flex-col gap-1 px-1">
        <h2 id="guess-q" className="text-[13px] font-medium text-faint">
          猜你想问
        </h2>
        <ul className="flex flex-col">
          {personalizedSuggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(item.question)}
                className="flex w-full items-center gap-2.5 rounded-lg py-2.5 text-left transition-colors active:bg-secondary/60 disabled:opacity-50"
              >
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary/50" />
                <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-foreground/75">{item.question}</span>
                <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-1 pb-2 text-center text-pretty text-[11px] leading-4 text-faint">
        回答由 AI 基于授权资料生成，仅供参考，不替代医生诊断
      </p>
    </div>
  )
}
