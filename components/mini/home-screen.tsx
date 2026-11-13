'use client'

import { useState, type ReactNode } from 'react'
import { FileText, HeartPulse, Pill, PackageSearch, RefreshCw } from 'lucide-react'
import Image from 'next/image'

const suggestionBatches = [
  [
    '孩子腹泻，成人药减半喂，可以吗？',
    '吃降压药，血压已经正常了，可以停药吗？',
    '减肥针听说副作用不少，普通人适合打吗？',
    '同样的药别人吃效果好，我却副作用大，是什么原因？',
    '阿莫西林可以搭配退烧药一起吃吗？',
  ],
  [
    '吃药期间能喝酒吗？头孢配酒真的很危险吗？',
    '感冒药和退烧药可以一起吃吗？',
    '降压药需要一直吃吗？血压正常了能停吗？',
    '吃完药多久可以喝牛奶、喝茶？',
    '基因检测能看出我适合吃哪些药吗？',
  ],
  [
    '孕期或备孕期间，哪些药不能随便吃？',
    '老人同时吃好几种药，会不会互相影响？',
    '抗生素没吃完一个疗程就停，会怎样？',
    '他汀类降脂药伤肝吗？要定期复查什么？',
    '保健品和处方药一起吃有冲突吗？',
  ],
]

const features = [
  { id: 'report', icon: FileText, title: '报告查询', question: '帮我查看并解读我的检测报告' },
  { id: 'package', icon: PackageSearch, title: '推荐套餐', question: '根据我的情况推荐合适的检测套餐' },
  { id: 'medication', icon: Pill, title: '用药咨询', question: '我想咨询一下用药问题' },
  { id: 'health', icon: HeartPulse, title: '健康管理', question: '帮我制定健康管理与用药提醒计划' },
]

/**
 * 首页即 AI 页（未开始对话）。
 * 版式：问候 + 助手形象 → 「大家都在问」卡 → 留白 → 底部（功能入口 → 胶囊输入）。
 */
export function HomeWelcome({
  onAsk,
  disabled,
  composer,
}: {
  onAsk: (question: string) => void
  disabled?: boolean
  /** 输入卡（ChatComposer pill 版，内含受检人选择） */
  composer: ReactNode
}) {
  const [batch, setBatch] = useState(0)
  const [spin, setSpin] = useState(0)
  const hello = 'Hi，我是您的用药助手'
  const line = '用药有疑问，随时问我'

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

        <div className="relative z-10 rounded-[20px] border border-white bg-white/60 px-4 pb-2 pt-3.5 shadow-[0_10px_30px_#3a82e40f] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] text-muted-foreground">大家都在问</h2>
            <button
              type="button"
              onClick={() => {
                setBatch((b) => (b + 1) % suggestionBatches.length)
                setSpin((s) => s + 1)
              }}
              className="-mr-1.5 flex h-7 items-center gap-1 rounded-full px-1.5 text-[12px] text-muted-foreground transition-colors active:bg-secondary/70"
            >
              <RefreshCw
                key={spin}
                className={`size-3.5 ${spin > 0 ? 'animate-[spin_0.5s_ease-out_1] motion-reduce:animate-none' : ''}`}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              换一批
            </button>
          </div>
          <ul className="mt-1 flex flex-col" aria-live="polite">
            {suggestionBatches[batch].map((question) => (
              <li key={question}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAsk(question)}
                  className="-mx-2 w-[calc(100%+1rem)] rounded-lg px-2 py-2 text-left text-[13px] leading-5 text-foreground transition-colors active:bg-secondary/70 disabled:opacity-50"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="sticky bottom-0 mt-auto pt-6">
        <HomeDock onAsk={onAsk} disabled={disabled} composer={composer} />
      </div>
    </div>
  )
}

/** 首页底部区：功能入口 → 胶囊输入卡 → 免责声明。首页欢迎态与对话态共用。 */
export function HomeDock({
  onAsk,
  disabled,
  composer,
}: {
  onAsk: (question: string) => void
  disabled?: boolean
  composer: ReactNode
}) {
  return (
      <div className="flex flex-col gap-3">
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
  )
}
