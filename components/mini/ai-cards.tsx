'use client'

import { useState } from 'react'
import { Check, ChevronRight, ClipboardList, FileText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { testServices } from '@/components/mini/tests-data'

export type CardKind = 'reports' | 'orders' | 'services' | 'guide'

export function detectCardKind(question: string): CardKind | null {
  if (/下单|购买|怎么买|引导/.test(question)) return 'guide'
  if (/我的报告|查看.*报告|报告列表|报告进度/.test(question)) return 'reports'
  if (/订单/.test(question)) return 'orders'
  if (/推荐.*(检测|服务)|适合做哪种|做什么检测/.test(question)) return 'services'
  return null
}

export const cardKindText: Record<CardKind, string> = {
  reports: '已为你找到 3 份检测报告',
  orders: '你有 3 笔进行中的订单',
  services: '为你推荐以下检测服务',
  guide: '已为你智能匹配检测套餐，并生成下单指引',
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

function ReportsCard() {
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
                aria-label={`查看${r.person.split('（')[0]}的${r.title}报告`}
                className="flex items-center gap-0.5 rounded-full bg-primary px-3 py-1 text-caption font-medium text-white"
              >
                查看报告
                <ChevronRight className="size-3" aria-hidden="true" />
              </button>
            ) : (
              <span className="text-caption text-faint">出报告后可查看</span>
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
          <p className="text-caption leading-4 text-muted-foreground">受检人：{o.person}</p>
          <p className="mt-1.5 rounded-lg bg-white px-2 py-1.5 text-caption leading-4 text-secondary-foreground">{o.step}</p>
          <div className="mt-2 flex justify-end border-t border-border pt-2">
            <button
              type="button"
              aria-label={`查看订单 ${o.id} 详情`}
              className="flex items-center gap-0.5 rounded-full border border-primary px-3 py-1 text-caption font-medium text-primary active:bg-secondary"
            >
              查看详情
              <ChevronRight className="size-3" aria-hidden="true" />
            </button>
          </div>
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

const guideMatches = [
  { id: 'cardio', match: 96, reason: '覆盖氯吡格雷、他汀、华法林等你咨询过的药物' },
  { id: 'hypertension', match: 88, reason: '长期服用降压药，评估药物敏感性' },
  { id: 'full', match: 82, reason: '多药联用，一次覆盖更全面' },
]

type GuideStep = { key: string; title: string; desc: string; action: string; done: string }

function GuideOrderCard({
  question,
  loggedIn,
  testeeName,
}: {
  question?: string
  loggedIn: boolean
  testeeName?: string
}) {
  const named = testServices.find((s) => question?.includes(s.name) || question?.includes(s.name.split(' ')[0]))
  const matches = guideMatches
    .map((m) => ({ ...m, service: testServices.find((s) => s.id === m.id && !s.offShelf) }))
    .filter((m): m is typeof m & { service: NonNullable<typeof m.service> } => Boolean(m.service))
    .sort((a, b) => (a.id === named?.id ? -1 : b.id === named?.id ? 1 : 0))
  const [selectedId, setSelectedId] = useState(matches[0]?.id)
  const selected = matches.find((m) => m.id === selectedId)?.service
  if (!selected) return null

  const steps: GuideStep[] = [
    {
      key: 'login',
      title: '注册 / 登录',
      desc: '前往登录页，微信手机号一键登录，新用户自动注册',
      action: '去登录',
      done: '已登录 · 138****6621',
    },
    {
      key: 'verify',
      title: '实名认证',
      desc: '前往实名认证页，完成身份证 + 人脸核验',
      action: '去认证',
      done: '王** · 已认证',
    },
    {
      key: 'checkout',
      title: '确认订单并支付',
      desc: `前往确认订单页，选择受检人与采样方式后微信支付 ¥${selected.price}`,
      action: '去下单',
      done: '',
    },
  ]
  const doneCount = loggedIn ? 1 : 0

  return (
    <div className="flex flex-col gap-3">
      <section aria-labelledby="guide-match-title">
        <h4 id="guide-match-title" className="mb-1.5 flex items-center gap-1 text-caption font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          智能匹配套餐
        </h4>
        <div role="radiogroup" aria-label="选择检测套餐" className="flex flex-col gap-1.5">
          {matches.map(({ id, match, reason, service }) => {
            const checked = id === selectedId
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setSelectedId(id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border p-2 text-left transition-colors disabled:opacity-60',
                  checked ? 'border-primary bg-secondary/60' : 'border-border bg-background/60',
                )}
              >
                <img src={service.image} alt="" className="size-11 shrink-0 rounded-lg bg-secondary object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-note font-medium leading-5 text-foreground">{service.name}</span>
                    <span className="shrink-0 rounded bg-primary/10 px-1 text-tag font-medium tabular-nums text-primary">
                      匹配 {match}%
                    </span>
                  </span>
                  <span className="block truncate text-caption leading-4 text-muted-foreground">{reason}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-note font-semibold tabular-nums text-destructive">¥{service.price}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full border',
                      checked ? 'border-primary bg-primary text-white' : 'border-border bg-white',
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="guide-steps-title" className="rounded-xl bg-background/60 p-2.5">
        <h4 id="guide-steps-title" className="flex items-center justify-between text-caption font-medium text-muted-foreground">
          <span>下单指引</span>
          <span className="tabular-nums text-primary">
            {Math.min(doneCount, steps.length)}/{steps.length}
          </span>
        </h4>
        <ol className="mt-2 flex flex-col">
          {steps.map((step, i) => {
            const state = i < doneCount ? 'done' : i === doneCount ? 'current' : 'todo'
            const last = i === steps.length - 1
            return (
              <li key={step.key} className="flex gap-2.5" aria-current={state === 'current' ? 'step' : undefined}>
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full text-tag font-semibold',
                      state === 'done' && 'bg-primary text-white',
                      state === 'current' && 'border-2 border-primary bg-white text-primary',
                      state === 'todo' && 'border border-border bg-white text-faint',
                    )}
                  >
                    {state === 'done' ? <Check className="size-3" strokeWidth={3} aria-hidden="true" /> : i + 1}
                  </span>
                  {!last && <span className={cn('w-px flex-1', i < doneCount ? 'bg-primary' : 'bg-border')} />}
                </div>
                <div className={cn('min-w-0 flex-1', !last && 'pb-3')}>
                  <p
                    className={cn(
                      'text-note font-medium leading-5',
                      state === 'todo' ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-caption leading-4 text-muted-foreground">
                    {state === 'done' ? step.done : step.desc}
                  </p>
                  {state === 'current' && (
                    <button
                      type="button"
                      className="mt-1.5 flex h-7 items-center gap-0.5 rounded-full bg-primary pl-3 pr-2 text-caption font-medium text-white"
                    >
                      {step.action}
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-2.5 border-t border-border pt-2 text-caption leading-4 text-muted-foreground">
          每一步将跳转至对应页面完成，完成后可返回 AI 咨询继续下一步。
        </p>
      </section>
    </div>
  )
}

export function ChatCard({
  kind,
  question,
  loggedIn = false,
  testeeName,
}: {
  kind: CardKind
  question?: string
  loggedIn?: boolean
  testeeName?: string
  onAsk?: (q: string) => void
}) {
  if (kind === 'guide') {
    return (
      <div>
        <p className="mb-2 text-body leading-6 text-foreground">
          {cardKindText.guide}，按步骤操作即可完成购买：
        </p>
        <GuideOrderCard question={question} loggedIn={loggedIn} testeeName={testeeName} />
        <p className="mt-2 text-caption leading-4 text-muted-foreground">推荐仅供参考，具体检测项目请结合医生建议选择。</p>
      </div>
    )
  }
  return (
    <div>
      <p className="mb-2 text-body leading-6 text-foreground">
        {cardKindText[kind]}
        {kind === 'services' ? '，可点击查看详情：' : '：'}
      </p>
      {kind === 'reports' && <ReportsCard />}
      {kind === 'orders' && <OrdersCard />}
      {kind === 'services' && <ServicesCard />}
      {kind === 'services' && (
        <p className="mt-2 text-caption leading-4 text-muted-foreground">推荐仅供参考，具体检测项目请结合医生建议选择。</p>
      )}
      <CardFooter label={kind === 'reports' ? '查看全部报告' : kind === 'orders' ? '查看全部订单' : '浏览更多检测服务'} />
    </div>
  )
}
