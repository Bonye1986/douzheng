'use client'

import { ChevronRight, ClipboardList, FileText, FlaskConical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { testServices } from '@/components/mini/tests-data'

export type CardKind = 'reports' | 'orders' | 'services'

export function detectCardKind(question: string): CardKind | null {
  if (/我的报告|查看.*报告|报告列表|报告进度/.test(question)) return 'reports'
  if (/订单/.test(question)) return 'orders'
  if (/推荐.*(检测|服务)|适合做哪种|做什么检测/.test(question)) return 'services'
  return null
}

export const cardKindText: Record<CardKind, string> = {
  reports: '已为你找到 3 份检测报告',
  orders: '你有 3 笔进行中的订单',
  services: '为你推荐以下检测服务',
}

const reports = [
  { id: 'r1', title: '心脑血管用药基因检测', person: '王建国（本人）', date: '2026-09-28', status: '已出报告', ready: true, hint: '4 项需关注' },
  { id: 'r2', title: '个体化用药基因检测 · 全面版', person: '李秀兰（母亲）', date: '2026-09-12', status: '已出报告', ready: true, hint: '2 项需关注' },
  { id: 'r3', title: '高血压用药基因检测', person: '张伟（配偶）', date: '预计 10-24', status: '检测中', ready: false, hint: '实验室检测中' },
]

const orders = [
  { id: 'DZ20261016100', product: '心脑血管用药基因检测', person: '王建国', status: '待采样', amount: '¥599', step: '采样盒已签收，请按指引完成采样' },
  { id: 'DZ20261014103', product: '高血压用药基因检测', person: '张伟', status: '检测中', amount: '¥399', step: '样本已到达实验室，预计 10-24 出报告' },
  { id: 'DZ20261018107', product: '儿童安全用药基因检测', person: '刘芳', status: '待付款', amount: '¥699', step: '剩余支付时间 23:41，超时自动关闭' },
]

const orderTone: Record<string, string> = {
  待采样: 'bg-secondary text-primary',
  检测中: 'bg-success-soft text-success',
  待付款: 'bg-warning-soft text-warning',
}

const recommendIds = [
  { id: 'cardio', reason: '你近期咨询过氯吡格雷、他汀用药，与心脑血管用药相关' },
  { id: 'hypertension', reason: '长期服用降压药，可评估药物敏感性' },
  { id: 'full', reason: '同时服用多种药物，一次覆盖更全面' },
]

function CardFooter({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="mt-2.5 flex w-full items-center justify-center gap-0.5 rounded-xl bg-secondary/70 py-2 text-caption font-medium text-primary active:bg-secondary"
    >
      {label}
      <ChevronRight className="size-3.5" aria-hidden="true" />
    </button>
  )
}

function ReportsCard({ onAsk }: { onAsk?: (q: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {reports.map((r) => (
        <li key={r.id} className="rounded-xl border border-border bg-background/60 p-2.5">
          <div className="flex items-start gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-note font-medium leading-5 text-foreground">{r.title}</p>
              <p className="truncate text-caption leading-4 text-muted-foreground">
                {r.person} · {r.date}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded px-1.5 py-px text-tag',
                r.ready ? 'bg-success-soft text-success' : 'bg-secondary text-primary',
              )}
            >
              {r.status}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className={cn('text-caption', r.ready ? 'text-warning' : 'text-muted-foreground')}>{r.hint}</span>
            {r.ready ? (
              <button
                type="button"
                onClick={() => onAsk?.(`帮我解读一下${r.person.split('（')[0]}的${r.title}报告`)}
                className="flex items-center gap-0.5 rounded-full bg-primary px-2.5 py-1 text-caption font-medium text-white"
              >
                <Sparkles className="size-3" aria-hidden="true" />
                AI 解读
              </button>
            ) : (
              <span className="text-caption text-faint">出报告后可解读</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function OrdersCard() {
  return (
    <ul className="flex flex-col gap-2">
      {orders.map((o) => (
        <li key={o.id} className="rounded-xl border border-border bg-background/60 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 text-caption text-muted-foreground">
              <ClipboardList className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate tabular-nums">{o.id}</span>
            </span>
            <span className={cn('shrink-0 rounded px-1.5 py-px text-tag', orderTone[o.status])}>{o.status}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-note font-medium text-foreground">{o.product}</p>
            <span className="shrink-0 text-note font-semibold tabular-nums text-foreground">{o.amount}</span>
          </div>
          <p className="text-caption leading-4 text-muted-foreground">检测人：{o.person}</p>
          <p className="mt-1.5 rounded-lg bg-white px-2 py-1.5 text-caption leading-4 text-secondary-foreground">{o.step}</p>
        </li>
      ))}
    </ul>
  )
}

function ServicesCard() {
  const list = recommendIds
    .map((r) => ({ ...r, service: testServices.find((s) => s.id === r.id) }))
    .filter((r) => r.service)
  return (
    <ul className="flex flex-col gap-2">
      {list.map(({ id, reason, service }, i) =>
        service ? (
          <li key={id} className="rounded-xl border border-border bg-background/60 p-2.5">
            <div className="flex gap-2.5">
              <img src={service.image} alt="" className="size-14 shrink-0 rounded-lg bg-secondary object-cover" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1">
                  {i === 0 && <span className="shrink-0 rounded bg-primary px-1 text-tag text-white">首推</span>}
                  <span className="truncate text-note font-medium leading-5 text-foreground">{service.name}</span>
                </p>
                <p className="mt-0.5 line-clamp-1 text-caption leading-4 text-muted-foreground">{service.summary}</p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-note font-semibold tabular-nums text-destructive">¥{service.price}</span>
                  {service.originalPrice && (
                    <span className="text-tag tabular-nums text-faint line-through">¥{service.originalPrice}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-white px-2 py-1.5">
  <p className="flex items-center gap-1 whitespace-nowrap text-caption font-medium text-foreground">
  <FlaskConical className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
  检测项目
  <span className="truncate font-normal text-muted-foreground">
                  · {service.genes.length} 个基因位点 · 覆盖 {service.drugCount} 种药物
                </span>
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1" aria-label={`${service.name}检测项目`}>
                {service.genes.map((g) => (
                  <li key={g} className="rounded bg-secondary px-1.5 py-px text-tag font-medium text-secondary-foreground">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 text-caption leading-4 text-muted-foreground">推荐理由：{reason}</p>
              <button
                type="button"
                className="shrink-0 rounded-full border border-primary px-2.5 py-1 text-caption font-medium text-primary"
              >
                查看详情
              </button>
            </div>
          </li>
        ) : null,
      )}
    </ul>
  )
}

export function ChatCard({ kind, onAsk }: { kind: CardKind; onAsk?: (q: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-body leading-6 text-foreground">
        {cardKindText[kind]}
        {kind === 'services' ? '，可点击查看详情：' : '：'}
      </p>
      {kind === 'reports' && <ReportsCard onAsk={onAsk} />}
      {kind === 'orders' && <OrdersCard />}
      {kind === 'services' && <ServicesCard />}
      {kind === 'services' && (
        <p className="mt-2 text-caption leading-4 text-muted-foreground">推荐仅供参考，具体检测项目请结合医生建议选择。</p>
      )}
      <CardFooter label={kind === 'reports' ? '查看全部报告' : kind === 'orders' ? '查看全部订单' : '浏览更多检测服务'} />
    </div>
  )
}
