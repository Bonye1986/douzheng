'use client'

import { ArrowUpRight, FileText, HeartPulse, PackageSearch, Pill } from 'lucide-react'
import Image from 'next/image'

const personalizedSuggestions = [
  { id: 'q1', question: '孩子生病，成人药掰开减半喂，可以吗？' },
  { id: 'q2', question: '症状好转就能停药吗？吃药没效果，能自行加量吗？' },
  { id: 'q3', question: '减肥针听说副作用不少，普通人适合打吗？' },
  { id: 'q4', question: '同样的药别人吃效果好，我却副作用大，是什么原因？' },
]
const quickActions = [
  { id: 'report', icon: FileText, label: '报告查询', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, label: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, label: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, label: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
]

/** 首页即 AI 页：未开始对话时展示的欢迎区（助手形象 + 快捷入口 + 猜你想问）。 */
export function HomeWelcome({ onAsk, disabled }: { onAsk: (question: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-5 pt-3">
      <section className="flex items-end justify-between gap-2 px-1">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 pb-3">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <p className="text-balance text-[24px] font-semibold leading-tight tracking-tight text-foreground">
            Hi，我是您的
            <br />
            <span className="text-primary">用药助手</span>
          </p>
          <p className="whitespace-nowrap text-[12.5px] leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，随时问我
          </p>
        </div>
        <div aria-hidden="true" className="relative flex h-[120px] w-[72px] shrink-0 items-end justify-center">
          <span className="absolute bottom-0.5 left-1/2 h-3 w-14 -translate-x-1/2 rounded-[50%] bg-[#1e3a8a]/15 blur-[6px]" />
          <div className="relative h-[114px] w-[76px] animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
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

      <nav aria-label="快捷功能" className="rounded-[20px] bg-white px-2 py-3 shadow-[0_6px_20px_#3a82e414]">
        <ul className="grid grid-cols-4">
          {quickActions.map(({ id, icon: Icon, label, question }) => (
            <li key={id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(question)}
                className="flex w-full flex-col items-center gap-1.5 rounded-xl py-1 transition-colors active:bg-secondary/60 disabled:opacity-50"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap text-[12px] font-medium leading-4 text-foreground">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="guess-q" className="flex flex-col gap-2.5">
        <h2 id="guess-q" className="px-1 text-[14px] font-semibold text-foreground">
          猜你想问
        </h2>
        <ul className="flex flex-col gap-2">
          {personalizedSuggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(item.question)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/80 px-3.5 py-3 text-left ring-1 ring-border/50 transition-colors active:bg-secondary/60 disabled:opacity-50"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground/85">
                  {item.question}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-1 text-center text-pretty text-[11px] leading-4 text-faint">
        回答由 AI 基于授权资料生成，仅供参考，不替代医生诊断
      </p>
    </div>
  )
}
