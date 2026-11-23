'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, LoaderCircle, ListChecks } from 'lucide-react'
import type { AiAnswer } from './ai-data'
import type { CardKind } from './ai-cards'

const subjects: Record<CardKind, string> = { reports: '报告列表', orders: '订单信息', services: '检测服务', guide: '下单指引' }
const phaseMs = 1350
export const replyDuration = phaseMs * 3

type Props = { question: string; kind?: CardKind; answer?: AiAnswer; pending?: boolean }

export function ReplyProgress({ question, kind, answer, pending = false }: Props) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!pending) return
    const timers = [1, 2].map(i => window.setTimeout(() => setPhase(i), phaseMs * i))
    return () => timers.forEach(id => window.clearTimeout(id))
  }, [pending])
  const subject = kind ? subjects[kind] : '回答要点'
  if (pending) return (
    <div role="status" className="flex items-center gap-2 text-caption leading-5 text-muted-foreground">
      <LoaderCircle aria-hidden="true" className="size-4 shrink-0 text-primary motion-safe:animate-spin" />
      <span>{['收到，我先看看你问的是什么…', `正在整理${subject}…`, '马上就好，把结果排得更清楚一点…'][phase]}</span>
    </div>
  )
  const steps = [
    ['收到问题', question],
    ['整理内容', kind ? `根据问题选用了${subject}卡片。` : `整理了 ${answer?.points.length ?? 0} 条要点。`],
    ['生成回复', kind ? `以${subject}卡片展示结果。` : answer?.sources.length ? `已列出参考来源：${answer.sources.map(source => source.title).join('、')}。` : '已按专业版格式排好回复。'],
  ]
  return (
    <details className="group mb-3 border-b border-border pb-2 text-caption leading-5">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded text-muted-foreground focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
        <ListChecks aria-hidden="true" className="size-4 text-primary" />执行过程
        <ChevronDown aria-hidden="true" className="ml-auto size-4 group-open:rotate-180" />
      </summary>
      <ol className="mt-2 flex flex-col gap-2">
        {steps.map(([label, detail]) => <li key={label} className="flex items-start gap-2"><Check aria-hidden="true" className="mt-1 size-3 shrink-0 text-primary" /><div><strong className="font-medium text-foreground">{label}</strong><p className="break-words text-muted-foreground">{detail}</p></div></li>)}
      </ol>
    </details>
  )
}
