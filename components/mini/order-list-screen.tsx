'use client'

import { useState } from 'react'
import { AlertTriangle, Building2, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type OrderPhase = 'all' | 'toPay' | 'toSample' | 'testing' | 'done' | 'after' | 'closed'
type OrderType = 'all' | 'self' | 'site'

const typeFilters: { key: OrderType; label: string }[] = [
  { key: 'all', label: '全部类型' },
  { key: 'self', label: '自采样' },
  { key: 'site', label: '定点采样' },
]

const phaseTabs: { key: OrderPhase; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'toPay', label: '待付款' },
  { key: 'toSample', label: '待采样' },
  { key: 'testing', label: '检测中' },
  { key: 'done', label: '已完成' },
  { key: 'after', label: '退款/售后' },
  { key: 'closed', label: '已关闭' },
]

type Order = {
  id: string
  type: Exclude<OrderType, 'all'>
  phase: Exclude<OrderPhase, 'all'>
  status: string
  product: string
  examinees: string
  amount: string
  originalAmount?: string
  note: string
  resample?: boolean
  priceChanged?: boolean
  unqualified?: boolean
  action?: { label: string; primary?: boolean }
}

const orders: Order[] = [
  {
    id: 'DZ20261015001',
    type: 'self',
    phase: 'toPay',
    status: '待付款',
    product: '药物基因检测',
    examinees: '王建国、李秀兰',
    amount: '¥1,697',
    originalAmount: '¥1,897',
    note: '客服已调整订单金额，请按最新价格支付',
    priceChanged: true,
    action: { label: '去支付', primary: true },
  },
  {
    id: 'DZ20261012003',
    type: 'self',
    phase: 'after',
    status: '样本不合格',
    product: '儿童安全用药基因检测',
    examinees: '李秀兰',
    amount: '¥699',
    note: '请选择重新采样或申请退款',
    unqualified: true,
    action: { label: '去处理', primary: true },
  },
  {
    id: 'DZ20261013008',
    type: 'self',
    phase: 'toSample',
    status: '已发货',
    product: '心血管用药基因检测',
    examinees: '王建国',
    amount: '¥899',
    note: '采样盒运输中，预计明日送达',
    action: { label: '查看物流' },
  },
  {
    id: 'DZ20261014002',
    type: 'site',
    phase: 'toSample',
    status: '待核销',
    product: '药物基因检测',
    examinees: '张伟',
    amount: '¥999',
    note: '请于 10-18 前往 都正检测中心（徐汇） 出示核销码',
    action: { label: '核销码', primary: true },
  },
  {
    id: 'DZ20261008005',
    type: 'self',
    phase: 'testing',
    status: '检测中',
    product: '精神类用药基因检测',
    examinees: '王建国',
    amount: '¥1,299',
    note: '实验室检测中，预计 10-20 出具报告',
  },
  {
    id: 'DZ20261009011',
    type: 'site',
    phase: 'testing',
    status: '已收样',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥0',
    note: '样本已送达实验室，等待上机检测',
    resample: true,
  },
  {
    id: 'DZ20260920004',
    type: 'self',
    phase: 'done',
    status: '已完成',
    product: '儿童安全用药基因检测',
    examinees: '李秀兰',
    amount: '¥699',
    note: '报告已于 2026-10-08 出具',
    action: { label: '查看报告', primary: true },
  },
  {
    id: 'DZ20261001007',
    type: 'site',
    phase: 'closed',
    status: '已关闭',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥999',
    note: '已选择重新采样，原订单关闭',
  },
]

export function countOrders(phase: Exclude<OrderPhase, 'all'>) {
  return orders.filter((o) => o.phase === phase).length
}

export function OrderListScreen({
  initialPhase = 'all',
  onBack,
  onHandleUnqualified,
}: {
  initialPhase?: OrderPhase
  onBack: () => void
  onHandleUnqualified: () => void
}) {
  const [phase, setPhase] = useState<OrderPhase>(initialPhase)
  const [type, setType] = useState<OrderType>('all')

  const visible = orders.filter((o) => (phase === 'all' || o.phase === phase) && (type === 'all' || o.type === type))

  return (
    <SubPage title="我的订单" titleId="order-list-title" onBack={onBack}>
      <div className="shrink-0 bg-white">
        <div role="tablist" aria-label="订单状态" className="flex gap-5 overflow-x-auto px-4 [scrollbar-width:none]">
          {phaseTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={phase === t.key}
              onClick={() => setPhase(t.key)}
              className={cn(
                'relative h-10 shrink-0 whitespace-nowrap text-[13px] transition-colors',
                phase === t.key ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              {phase === t.key && (
                <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-primary" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 px-3 py-2.5" role="group" aria-label="订单类型">
        {typeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={type === f.key}
            onClick={() => setType(f.key)}
            className={cn(
              'h-7 rounded-full px-3 text-[12px] transition-colors',
              type === f.key ? 'bg-primary/10 font-medium text-primary' : 'bg-white text-muted-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6 [scrollbar-width:none]">
        {visible.length === 0 && (
          <li className="py-16 text-center text-[13px] text-muted-foreground">暂无相关订单</li>
        )}
        {visible.map((o) => {
          const TypeIcon = o.type === 'self' ? Home : Building2
          return (
            <li key={o.id} className="rounded-2xl bg-white p-3.5">
              <div className="flex items-center gap-1.5">
                <TypeIcon className="size-3.5 text-primary" aria-hidden="true" />
                <span className="text-[12px] text-muted-foreground">{o.type === 'self' ? '自采样' : '定点采样'}</span>
                {o.resample && (
                  <span className="rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">重采样</span>
                )}
                {o.priceChanged && (
                  <span className="rounded bg-[#ffeadb] px-1 text-[10px] font-medium text-[#d9621a]">已改价</span>
                )}
                <span
                  className={cn(
                    'ml-auto text-[12px] font-medium',
                    o.phase === 'closed' || o.phase === 'done'
                      ? 'text-muted-foreground'
                      : o.unqualified || o.phase === 'toPay'
                        ? 'text-[#e0651c]'
                        : 'text-primary',
                  )}
                >
                  {o.status}
                </span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-foreground">{o.product}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">受检人：{o.examinees}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-[14px] font-semibold tabular-nums text-foreground">{o.amount}</span>
                  {o.originalAmount && (
                    <span className="block text-[11px] tabular-nums text-muted-foreground line-through">
                      {o.originalAmount}
                    </span>
                  )}
                </p>
              </div>

              <p
                className={cn(
                  'mt-2 flex items-start gap-1 rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed',
                  o.unqualified ? 'bg-[#fff4ec] text-[#c4581a]' : 'bg-[#f6f8fc] text-muted-foreground',
                )}
              >
                {o.unqualified && <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />}
                {o.note}
              </p>

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] tabular-nums text-muted-foreground">{o.id}</span>
                {o.action && (
                  <button
                    type="button"
                    onClick={() => o.unqualified && onHandleUnqualified()}
                    className={cn(
                      'h-7 rounded-full px-3.5 text-[12px] font-medium',
                      o.action.primary
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-[#dfe5ef] text-foreground',
                    )}
                  >
                    {o.action.label}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </SubPage>
  )
}
