'use client'

import { ChevronRight, FileText, HeartPulse, PackageSearch, Pill } from 'lucide-react'
import Image from 'next/image'
import { Fragment } from 'react'

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
    <div className="flex flex-col gap-6 pt-2">
      <section className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="sr-only">药问基因 DRUGENE · 临床精准用药助手</h1>
          <p className="text-balance text-[22px] font-semibold leading-tight text-foreground">
            Hi，我是您的
            <br />
            <span className="text-primary">用药助手</span>
          </p>
          <p className="text-pretty text-caption leading-relaxed text-muted-foreground">
            用药疑问、基因检测、报告解读，随时问我
          </p>
        </div>
        <div aria-hidden="true" className="relative flex h-[104px] w-[70px] shrink-0 items-end justify-center">
          <span className="absolute bottom-1 left-1/2 h-2.5 w-12 -translate-x-1/2 rounded-[50%] bg-[#1e3a8a]/15 blur-[5px]" />
          <div className="relative h-[98px] w-[62px] animate-[robot-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
            <Image
              src="/images/drugene-robot.png"
              alt=""
              fill
              sizes="62px"
              priority
              className="object-contain object-bottom drop-shadow-[0_8px_10px_rgba(30,58,138,0.18)]"
            />
          </div>
        </div>
      </section>

      <nav aria-label="快捷功能">
        <ul className="flex items-center rounded-2xl bg-white py-1 shadow-[0_4px_14px_#3a82e40d]">
          {quickActions.map(({ id, icon: Icon, label, question }, index) => (
            <Fragment key={id}>
              {index > 0 && <li aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />}
              <li className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAsk(question)}
                  className="flex h-9 w-full items-center justify-center gap-1 rounded-xl text-[12px] font-medium text-foreground transition-colors active:bg-secondary/60 disabled:opacity-50"
                >
                  <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              </li>
            </Fragment>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="guess-q" className="flex flex-col gap-2">
        <h2 id="guess-q" className="px-1 text-note font-semibold text-foreground">
          猜你想问
        </h2>
        <ul className="flex flex-col rounded-2xl bg-white px-3.5 shadow-[0_4px_14px_#3a82e40d]">
          {personalizedSuggestions.map((item, index) => (
            <li key={item.id} className={index > 0 ? 'border-t border-border/60' : undefined}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(item.question)}
                className="flex w-full items-center gap-2 py-3 text-left transition-opacity active:opacity-60 disabled:opacity-50"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground/80">
                  {item.question}
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <p className="px-1 pt-1 text-center text-pretty text-[11px] leading-4 text-faint">
          回答由 AI 基于授权资料生成，仅供参考，不替代医生诊断
        </p>
      </section>
    </div>
  )
}
