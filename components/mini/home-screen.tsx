'use client'

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

/** 首页即 AI 页：未开始对话时展示的欢迎区（助手形象 + 快捷入口 + 猜你想问）。 */
export function HomeWelcome({ onAsk, disabled }: { onAsk: (question: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col">
      <section className="flex items-center justify-between gap-2 px-1 pt-1">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <p className="text-balance text-[22px] font-semibold leading-tight text-foreground">
            Hi，我是您的
            <br />
            <span className="text-primary">用药助手</span>
          </p>
          <p className="mt-2 text-pretty text-caption leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，随时问我
          </p>
        </div>
        <div aria-hidden="true" className="relative flex h-[112px] w-[74px] shrink-0 items-end justify-center">
          <span className="absolute bottom-1.5 left-1/2 h-2.5 w-12 -translate-x-1/2 rounded-[50%] bg-[#1e3a8a]/15 blur-[5px]" />
          <div className="relative h-[104px] w-[66px] animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
            <Image
              src="/images/drugene-robot.png"
              alt=""
              fill
              sizes="66px"
              priority
              className="object-contain object-bottom drop-shadow-[0_8px_10px_rgba(30,58,138,0.18)]"
            />
          </div>
        </div>
      </section>

      <nav aria-label="快捷功能" className="mt-4">
        <ul className="grid grid-cols-4 gap-2">
          {quickActions.map(({ id, icon: Icon, label, question }) => (
            <li key={id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(question)}
                className="flex h-9 w-full items-center justify-center gap-1 rounded-[9px] border border-border/70 bg-white text-[12px] font-medium leading-4 text-foreground transition-colors active:bg-primary/5 disabled:opacity-50"
              >
                <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="guess-q" className="mt-5 rounded-2xl bg-white/70 px-3 py-2.5">
        <h2 id="guess-q" className="pb-1 text-[12px] font-medium text-faint">
          猜你想问
        </h2>
        <ul className="flex flex-col">
          {personalizedSuggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(item.question)}
                className="flex w-full items-center gap-2 py-1.5 text-left transition-opacity active:opacity-60 disabled:opacity-50"
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

      <p className="mt-3 px-1 text-pretty text-[11px] leading-4 text-faint">
        回答基于已授权资料和知识来源生成，医疗问题需结合专业人员判断；紧急或严重不适请及时就医。
      </p>
    </div>
  )
}
