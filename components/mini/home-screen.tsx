'use client'

import type { ReactNode } from 'react'
import { ChevronRight, FileText, HeartPulse, Pill, PackageSearch, Hash } from 'lucide-react'
import Image from 'next/image'

const suggestions = [
  { id: 'q1', question: '孩子生病，成人药能减半喂吗？' },
  { id: 'q2', question: '症状好转了，能自己停药吗？' },
  { id: 'q3', question: '吃药没效果，能自行加量吗？' },
  { id: 'q4', question: '同样的药，为何我副作用更大？' },
  { id: 'q5', question: '每天多杯咖啡，需要补钙吗？' },
]

const features = [
  { id: 'report', icon: FileText, title: '报告查询', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, title: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, title: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, title: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
]

function greetingByHour(hour: number) {
  if (hour < 6) return { hello: '夜深了！', line: '早点休息，按时用药更安心' }
  if (hour < 11) return { hello: '早上好！', line: '早餐后的药，别忘了按时吃' }
  if (hour < 13) return { hello: '中午好！', line: '饭后稍作休息，再服药更合适' }
  if (hour < 18) return { hello: '下午好！', line: '用药上有疑问，随时问我' }
  return { hello: '晚上好！', line: '睡前用药前，可以先问问我' }
}

/**
 * 首页即 AI 页（未开始对话）。
 * 版式：受检人/回答风格（与对话页同位）→ 问候 + 助手形象 → 「你可以这样问」卡 → 留白 → 底部（功能入口 → 胶囊输入）。
 */
export function HomeWelcome({
  onAsk,
  disabled,
  composer,
  subject,
  styleToggle,
}: {
  onAsk: (question: string) => void
  disabled?: boolean
  /** 胶囊输入（ChatComposer pill 版） */
  composer: ReactNode
  /** 受检人选择（问候语下方） */
  subject: ReactNode
  /** 通俗/专业切换（「你可以这样问」卡片标题右侧） */
  styleToggle: ReactNode
}) {
  const { hello, line } = greetingByHour(new Date().getHours())

  return (
    <div className="flex min-h-full flex-col">
      <section className="relative pt-1">
        <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
        <div className="relative z-0 flex items-end justify-between">
          <div className="flex min-w-0 flex-col gap-1.5 pb-5 pl-2" suppressHydrationWarning>
            <p className="text-[20px] font-semibold leading-tight text-primary" suppressHydrationWarning>
              {hello}
            </p>
            <p className="text-pretty text-[18px] font-semibold leading-snug text-foreground" suppressHydrationWarning>
              {line}
            </p>
            <div className="mt-1.5 flex">{subject}</div>
          </div>
          <div aria-hidden="true" className="relative -mb-6 mr-2 h-[112px] w-[84px] shrink-0">
            <div className="relative size-full animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
              <Image
                src="/images/drugene-robot.png"
                alt=""
                fill
                sizes="84px"
                priority
                className="object-contain object-top drop-shadow-[0_8px_10px_rgba(30,58,138,0.18)]"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 rounded-[24px] border border-white bg-white/55 p-4 shadow-[0_10px_30px_#3a82e40f] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-[14px] text-muted-foreground">你可以这样问</h2>
            {styleToggle}
          </div>
          <ul className="mt-3 flex flex-col divide-y divide-[#eef3fc] overflow-hidden rounded-2xl bg-white">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAsk(item.question)}
                  className="group flex h-11 w-full items-center gap-2.5 px-3.5 text-left transition-colors active:bg-secondary/60 disabled:opacity-50"
                >
                  <span aria-hidden="true" className="flex size-[18px] shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Hash className="size-3" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{item.question}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-faint transition-transform group-active:translate-x-0.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-3 pt-6">
        <nav aria-label="常用功能" className="-mx-4">
          <ul className="flex gap-1.5 px-4">
            {features.map(({ id, icon: Icon, title, question }) => (
              <li key={id} className="min-w-0 flex-auto">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAsk(question)}
                  className="flex h-9 w-full items-center justify-center gap-0.5 rounded-xl bg-white px-1 shadow-[0_2px_10px_#3a82e40a] ring-1 ring-[#eef3fc] transition-colors active:bg-secondary/60 disabled:opacity-50"
                >
                  <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
                  <span className="whitespace-nowrap text-[13px] font-medium text-foreground">{title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {composer}

        <p className="text-center text-[11px] leading-4 text-faint">内容由 AI 生成，仅供参考，不替代医生诊断</p>
      </div>
    </div>
  )
}
